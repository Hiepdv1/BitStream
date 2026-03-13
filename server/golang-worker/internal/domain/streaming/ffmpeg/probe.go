package ffmpeg

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"math"
	"os/exec"
	"time"
)

const (
	ProbeMaxRetries = 15
	ProbeBaseDelay  = 1 * time.Second
	ProbeMaxDelay   = 10 * time.Second
	ProbeTimeout    = 10 * time.Second
)

type ProbeResult struct {
	Width  int     `json:"width"`
	Height int     `json:"height"`
	Codec  string  `json:"codec"`
	FPS    float64 `json:"fps"`
}

type ffprobeOutput struct {
	Streams []ffprobeStream `json:"streams"`
}

type ffprobeStream struct {
	CodecType  string `json:"codec_type"`
	CodecName  string `json:"codec_name"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	RFrameRate string `json:"r_frame_rate"`
}

func ProbeStream(ctx context.Context, rtmpURL string) (*ProbeResult, error) {
	probeCtx, cancel := context.WithTimeout(ctx, ProbeTimeout)
	defer cancel()

	args := []string{
		"-v", "quiet",
		"-print_format", "json",
		"-show_streams",
		"-select_streams", "v:0",
		"-rw_timeout", "5000000",
		"-rtmp_live", "live",
		rtmpURL,
	}

	cmd := exec.CommandContext(probeCtx, "ffprobe", args...)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ffprobe failed: %w", err)
	}

	var result ffprobeOutput
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("ffprobe parse error: %w", err)
	}

	if len(result.Streams) == 0 {
		return nil, fmt.Errorf("ffprobe: no video streams found")
	}

	vs := result.Streams[0]
	if vs.Width == 0 || vs.Height == 0 {
		return nil, fmt.Errorf("ffprobe: invalid resolution %dx%d", vs.Width, vs.Height)
	}

	fps := parseFPS(vs.RFrameRate)

	return &ProbeResult{
		Width:  vs.Width,
		Height: vs.Height,
		Codec:  vs.CodecName,
		FPS:    fps,
	}, nil
}

func ProbeStreamWithRetry(ctx context.Context, rtmpURL string, streamID string) (*ProbeResult, error) {
	var lastErr error

	for attempt := 1; attempt <= ProbeMaxRetries; attempt++ {
		select {
		case <-ctx.Done():
			return nil, fmt.Errorf("probe cancelled: %w", ctx.Err())
		default:
		}

		result, err := ProbeStream(ctx, rtmpURL)
		if err == nil {
			slog.Info("ffprobe succeeded",
				"streamId", streamID,
				"attempt", attempt,
				"width", result.Width,
				"height", result.Height,
				"codec", result.Codec,
				"fps", result.FPS,
			)
			return result, nil
		}

		lastErr = err
		delay := computeBackoff(attempt)

		slog.Warn("ffprobe attempt failed, retrying",
			"streamId", streamID,
			"attempt", attempt,
			"maxRetries", ProbeMaxRetries,
			"nextDelay", delay,
			"error", err,
		)

		select {
		case <-ctx.Done():
			return nil, fmt.Errorf("probe cancelled during backoff: %w", ctx.Err())
		case <-time.After(delay):
		}
	}

	return nil, fmt.Errorf("ffprobe failed after %d retries: %w", ProbeMaxRetries, lastErr)
}

func computeBackoff(attempt int) time.Duration {
	delay := min(ProbeBaseDelay*time.Duration(math.Pow(2, float64(attempt-1))), ProbeMaxDelay)
	return delay
}

func parseFPS(rFrameRate string) float64 {
	var num, den int
	n, _ := fmt.Sscanf(rFrameRate, "%d/%d", &num, &den)
	if n == 2 && den > 0 {
		return float64(num) / float64(den)
	}
	return 30.0
}
