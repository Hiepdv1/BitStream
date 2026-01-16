package ffmpeg

import (
	"context"
	"os/exec"
	"path/filepath"
)

func BuildCommandContext(ctx context.Context, RTMPUrl, outputPath string) *exec.Cmd {
	targetDir := filepath.Dir(outputPath)

	segmentPath := filepath.Join(targetDir, "index%d.ts")

	cleanOutputPath := filepath.ToSlash(outputPath)
	cleanSegmentPath := filepath.ToSlash(segmentPath)

	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", RTMPUrl,
		"-c:v", "copy",
		"-c:a", "copy",
		"-f", "hls",
		"-hls_time", "4",
		"-hls_list_size", "0",
		"-hls_playlist_type", "vod",
		"-hls_flags", "independent_segments",
		"-hls_segment_filename", cleanSegmentPath,
		cleanOutputPath,
	)

	return cmd
}
