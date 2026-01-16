package ffmpeg

import (
	"context"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/bitstream/backend-go/internal/utils"
)

type StreamProcess struct {
	StreamID string
	Cmd      *exec.Cmd
	Ctx      context.Context
	Cancel   context.CancelFunc
}

func EnsureHlsDirectory(streamId string) string {
	root := os.Getenv("HLS_STORAGE_PATH")
	if root == "" {
		root = filepath.Join(utils.GetProjectRoot(), "hls")
	}

	root = filepath.Clean(root)
	targetDir := filepath.Join(root, streamId)

	slog.Info("Checking directory", "path", targetDir)

	err := os.MkdirAll(targetDir, 0755)
	if err != nil {
		slog.Error("Failed to create HLS directory", "path", targetDir, "error", err)
	}

	return filepath.Join(targetDir, "index.m3u8")
}

func NewStreamProcess(streamID string, rtmp string) (*StreamProcess, error) {
	ctx, cancel := context.WithCancel(context.Background())

	outputPath := EnsureHlsDirectory(streamID)

	// ffmpegPath := "ffmpeg"
	// if envPath := os.Getenv("FFMPEG_PATH"); envPath != "" {
	// 	ffmpegPath = envPath
	// }

	// cmd := exec.CommandContext(ctx, ffmpegPath,
	// 	"-i", rtmp,
	// 	"-c:v", "libx264",
	// 	"-c:a", "aac",
	// 	"-f", "hls",
	// 	"-hls_time", "3",
	// 	"-hls_list_size", "10",
	// 	"-hls_flags", "delete_segments",
	// 	outputPath,
	// )

	cmd := BuildCommandContext(ctx, rtmp, outputPath)

	if err := cmd.Start(); err != nil {
		cancel()
		return nil, err
	}

	return &StreamProcess{
		StreamID: streamID,
		Cmd:      cmd,
		Ctx:      ctx,
		Cancel:   cancel,
	}, nil
}

func (p *StreamProcess) Kill() error {
	p.Cancel()
	if p.Cmd.Process != nil {
		return p.Cmd.Process.Kill()
	}
	return nil
}
