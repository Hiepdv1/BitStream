package ffmpeg

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
)

func BuildCommandContextTest(ctx context.Context, RTMPUrl, streamDir string) *exec.Cmd {
	segmentPath := filepath.Join(streamDir, "seg_%05d.ts")
	dvrPlaylist := filepath.Join(streamDir, "dvr.m3u8")

	args := []string{
		"-rw_timeout", "5000000",
		"-rtmp_live", "live",

		"-fflags", "+genpts",
		"-i", RTMPUrl,

		"-c:v", "copy",
		"-c:a", "copy",

		"-f", "hls",
		"-hls_time", "2",
		"-hls_list_size", "0",
	}

	if _, err := os.Stat(dvrPlaylist); err == nil {
		args = append(args, "-hls_start_number_source", "generic")
	}

	args = append(args,
		"-hls_flags", "append_list+independent_segments",
		"-hls_segment_filename", filepath.ToSlash(segmentPath),
		filepath.ToSlash(dvrPlaylist),
	)

	return exec.CommandContext(ctx, "ffmpeg", args...)
}

func BuildCommandContextProd(ctx context.Context, RTMPUrl, streamDir string) *exec.Cmd {
	segmentPath := filepath.Join(streamDir, "seg_%05d.ts")
	dvrPlaylist := filepath.Join(streamDir, "dvr.m3u8")

	args := []string{
		"-rw_timeout", "5000000",
		"-rtmp_live", "live",

		"-fflags", "+genpts",
		"-i", RTMPUrl,

		// VIDEO
		"-c:v", "libx264",
		"-preset", "veryfast",
		"-profile:v", "main",
		"-pix_fmt", "yuv420p",
		"-g", "60",
		"-keyint_min", "60",
		"-sc_threshold", "0",

		// AUDIO
		"-c:a", "aac",
		"-b:a", "128k",
		"-ar", "48000",
		"-ac", "2",

		// HLS
		"-f", "hls",
		"-hls_time", "2",
		"-hls_list_size", "0",
	}

	if _, err := os.Stat(dvrPlaylist); err == nil {
		args = append(args, "-hls_start_number_source", "generic")
	}

	args = append(args,
		"-hls_flags", "append_list+independent_segments",
		"-hls_segment_filename", filepath.ToSlash(segmentPath),
		filepath.ToSlash(dvrPlaylist),
	)

	return exec.CommandContext(ctx, "ffmpeg", args...)
}
