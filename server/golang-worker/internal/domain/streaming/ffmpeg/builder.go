package ffmpeg

import (
	"context"
	"os/exec"
	"path/filepath"
)

func BuildStreamCommand(
	ctx context.Context,
	rtmpURL string,
	streamDir string,
	env string,
) *exec.Cmd {

	baseArgs := []string{
		// RTMP input settings
		"-rw_timeout", "10000000",
		"-fflags", "+genpts+igndts+discardcorrupt",
		"-rtmp_live", "live",
		"-i", rtmpURL,
	}

	encodingArgs := []string{
		// Video encoding
		"-c:v", "libx264",
		"-preset", "veryfast",
		"-tune", "zerolatency",
		"-profile:v", "main",
		"-level", "4.0",

		"-g", "60",
		"-keyint_min", "60",
		"-sc_threshold", "0",
		"-force_key_frames", "expr:gte(t,n_forced*2)",

		// Bitrate
		"-b:v", "2500k",
		"-maxrate", "2800k",
		"-bufsize", "5000k",
		"-pix_fmt", "yuv420p",

		// Audio encoding
		"-c:a", "aac",
		"-b:a", "128k",
		"-ar", "48000",
		"-ac", "2",
	}

	dashArgs := []string{
		"-f", "dash",

		"-seg_duration", "2",
		"-frag_duration", "2",
		"-min_seg_duration", "2000000",

		"-window_size", "15",
		"-extra_window_size", "30",

		"-remove_at_exit", "0",

		"-use_template", "1",
		"-use_timeline", "1",

		"-streaming", "1",
		"-ldash", "1",

		"-target_latency", "4",
		"-write_prft", "1",

		"-utc_timing_url", "https://time.akamai.com/?iso",

		"-adaptation_sets", "id=0,streams=v id=1,streams=a",

		"-init_seg_name", "init-$RepresentationID$.mp4",
		"-media_seg_name", "chunk-$RepresentationID$-$Number$.m4s",

		filepath.ToSlash(filepath.Join(streamDir, "manifest.mpd")),
	}

	args := append(baseArgs, encodingArgs...)
	args = append(args, dashArgs...)

	return exec.CommandContext(ctx, "ffmpeg", args...)
}
