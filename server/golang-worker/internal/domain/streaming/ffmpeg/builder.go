package ffmpeg

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

const SegDuration = 2

// StreamConfig allows flexible configuration for A/V encoding
type StreamConfig struct {
	VideoCodec      string
	VideoPreset     string
	AudioCodec      string
	AudioBitrate    string
	AudioSampleRate string
	AudioChannels   string
}

// BuilderOption defines a function to modify StreamConfig
type BuilderOption func(*StreamConfig)

func WithVideoCodec(codec string) BuilderOption {
	return func(c *StreamConfig) { c.VideoCodec = codec }
}

func WithVideoPreset(preset string) BuilderOption {
	return func(c *StreamConfig) { c.VideoPreset = preset }
}

var segmentRegex = regexp.MustCompile(`chunk-.*-(\d+)\.m4s$`)

// ===============================
// Resume helper
// ===============================
func getLastSegmentNumber(dir string) (int, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return 0, err
	}
	maxNum := 0
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		matches := segmentRegex.FindStringSubmatch(file.Name())
		if len(matches) > 1 {
			num, _ := strconv.Atoi(matches[1])
			if num > maxNum {
				maxNum = num
			}
		}
	}
	return maxNum, nil
}

// ===============================
// MAIN BUILD FUNCTION
// ===============================
func BuildStreamCommand(
	ctx context.Context,
	rtmpURL string,
	streamDir string,
	env string,
	ladders []int,
	inputFPS float64,
	opts ...BuilderOption,
) (*exec.Cmd, []int, error) {

	config := &StreamConfig{
		VideoCodec:      "libx264",
		AudioCodec:      "aac",
		AudioBitrate:    "128k",
		AudioSampleRate: "48000",
		AudioChannels:   "2",
	}
	for _, opt := range opts {
		opt(config)
	}

	lastNum, err := getLastSegmentNumber(streamDir)
	if err != nil && !os.IsNotExist(err) {
		return nil, nil, err
	}
	isResume := lastNum > 0
	startNum := lastNum + 1

	fps := inputFPS
	if fps > 60 {
		fps = 60
	}
	if fps < 24 {
		fps = 24
	}
	fpsInt := int(fps)

	segDur := SegDuration
	gopSize := fpsInt * segDur

	baseArgs := []string{
		"-rw_timeout", "15000000",
		"-fflags", "+genpts+igndts+discardcorrupt",
		"-threads", "0",
		"-thread_queue_size", "4096",
		"-rtmp_live", "live",
		"-i", rtmpURL,
	}

	// -----------------------
	// Build filter complex
	// -----------------------
	splitCount := len(ladders)
	splitLabels := make([]string, splitCount)
	for i := range ladders {
		splitLabels[i] = "[v" + strconv.Itoa(i+1) + "]"
	}

	filter := "[0:v]setsar=1,fps=" + strconv.Itoa(fpsInt) + ",split=" + strconv.Itoa(splitCount) +
		strings.Join(splitLabels, "") + ";"

	for i, h := range ladders {
		cfg := GetLadderConfig(h)
		filter += splitLabels[i] +
			"scale=" + strconv.Itoa(cfg.Width) + ":" + strconv.Itoa(h) +
			":flags=lanczos" +
			",setsar=1,setdar=16/9,format=yuv420p" +
			"[vout" + strconv.Itoa(i) + "];"
	}
	filter = strings.TrimSuffix(filter, ";")

	encodingArgs := []string{"-filter_complex", filter}

	for i, h := range ladders {
		cfg := GetLadderConfig(h)
		encodingArgs = append(encodingArgs,
			"-map", "[vout"+strconv.Itoa(i)+"]",
			"-c:v:"+strconv.Itoa(i), config.VideoCodec,
			"-b:v:"+strconv.Itoa(i), cfg.Bitrate,
			"-maxrate:v:"+strconv.Itoa(i), cfg.MaxRate,
			"-bufsize:v:"+strconv.Itoa(i), cfg.BufSize,
			"-profile:v:"+strconv.Itoa(i), "high",
		)

		if config.VideoCodec == "h264_nvenc" {
			preset := config.VideoPreset
			if preset == "" {
				preset = "p4"
			}
			encodingArgs = append(encodingArgs,
				"-preset:v:"+strconv.Itoa(i), preset,
				"-tune:v:"+strconv.Itoa(i), "hq",
				"-rc:v:"+strconv.Itoa(i), "vbr",
			)
		} else { // default to libx264
			encodingArgs = append(encodingArgs,
				"-level:v:"+strconv.Itoa(i), cfg.Level,
				"-x264-params", "nal-hrd=cbr:force-cfr=1:rc-lookahead=10:sliced-threads=0",
			)
		}
	}

	if config.VideoCodec != "h264_nvenc" {
		preset := config.VideoPreset
		if preset == "" {
			preset = "veryfast"
		}
		encodingArgs = append(encodingArgs, "-preset", preset)
	}

	encodingArgs = append(encodingArgs,
		"-r", strconv.Itoa(fpsInt),

		"-g", strconv.Itoa(gopSize),
		"-keyint_min", strconv.Itoa(gopSize),
		"-sc_threshold", "0",
		"-force_key_frames", "expr:gte(t,n_forced*"+strconv.Itoa(segDur)+")",
		"-pix_fmt", "yuv420p",

		"-map", "0:a?",
		"-c:a", config.AudioCodec,
		"-b:a", config.AudioBitrate,
		"-ar", config.AudioSampleRate,
		"-ac", config.AudioChannels,
	)

	dashArgs := []string{

		"-f", "dash",

		"-seg_duration", strconv.Itoa(segDur),

		"-streaming", "1",

		"-remove_at_exit", "0",

		"-window_size", "5",

		"-extra_window_size", "5",

		"-use_template", "1",

		"-use_timeline", "1",

		"-index_correction", "1",

		"-write_prft", "1",

		"-utc_timing_url", "https://time.akamai.com/?iso",

		"-adaptation_sets", "id=0,streams=v id=1,streams=a",

		"-init_seg_name", "init-$RepresentationID$.mp4",

		"-media_seg_name", "chunk-$RepresentationID$-$Number$.m4s",

		"-update_period", "2",
	}

	if isResume {
		dashArgs = append(dashArgs, "-start_number", strconv.Itoa(startNum))
	}

	dashArgs = append(dashArgs, filepath.Join(streamDir, "manifest.mpd"))

	args := append(baseArgs, encodingArgs...)
	args = append(args, dashArgs...)

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	return cmd, ladders, nil
}
