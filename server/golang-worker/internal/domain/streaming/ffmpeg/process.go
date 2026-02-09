package ffmpeg

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/storage/minio"
)

const (
	GracefulShutdownTimeout   = time.Minute
	WaitForNaturalExitTimeout = 10 * time.Minute
)

type StreamProcess struct {
	StreamID  string
	cmd       *exec.Cmd
	ctx       context.Context
	cancel    context.CancelFunc
	outputDir string
	queries   *stream.Queries

	stdin  io.WriteCloser
	stderr *bytes.Buffer

	done    chan struct{}
	exitErr error

	mu         sync.Mutex
	manualStop bool
}

func GetStreamDirectory(outputDir, streamId string) string {
	root := filepath.Clean(outputDir)
	targetDir := filepath.Join(root, streamId)
	_ = os.MkdirAll(targetDir, 0755)
	return targetDir
}

func NewStreamProcess(
	streamID string,
	rtmp string,
	outputDir, env string,
	queries *stream.Queries,
	storage *minio.Service,
) (*StreamProcess, error) {
	ctx, cancel := context.WithCancel(context.Background())
	streamDir := GetStreamDirectory(outputDir, streamID)

	cmd := BuildStreamCommand(ctx, rtmp, streamDir, env)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		cancel()
		return nil, err
	}

	stderrBuf := &bytes.Buffer{}
	cmd.Stderr = stderrBuf

	slog.Info("Starting FFmpeg process", "streamId", streamID, "command", cmd.String())

	if err := cmd.Start(); err != nil {
		cancel()
		return nil, err
	}

	proc := &StreamProcess{
		StreamID:   streamID,
		cmd:        cmd,
		ctx:        ctx,
		cancel:     cancel,
		stdin:      stdinPipe,
		stderr:     stderrBuf,
		done:       make(chan struct{}),
		manualStop: false,
		outputDir:  outputDir,
		queries:    queries,
	}

	tracker := NewSegmentTracker(ctx, streamID, streamDir, queries, storage)

	go tracker.Run()

	go proc.monitor()

	return proc, nil
}

func (p *StreamProcess) monitor() {
	p.exitErr = p.cmd.Wait()
	p.cancel()
	close(p.done)

	slog.Info("FFmpeg process exited",
		"streamId", p.StreamID,
		"manualStop", p.manualStop,
		"error", p.exitErr,
		"stderr", p.stderr.String(),
	)
}

func (p *StreamProcess) Stop() error {
	p.mu.Lock()
	if p.manualStop {
		p.mu.Unlock()
		return nil
	}
	p.manualStop = true
	p.mu.Unlock()

	slog.Info("Shutdown sequence initiated", "streamId", p.StreamID)

	if p.waitForNaturalExit(WaitForNaturalExitTimeout) {
		return nil
	}

	if p.requestGracefulStop(GracefulShutdownTimeout) {
		return nil
	}

	return p.terminateForcibly()
}

func (p *StreamProcess) waitForNaturalExit(timeout time.Duration) bool {
	slog.Info("Stage 1: Waiting for natural EOF", "streamId", p.StreamID, "timeout", timeout)
	select {
	case <-p.done:
		slog.Info("Shutdown successful: Stream finished naturally (EOF)", "streamId", p.StreamID)
		return true
	case <-time.After(timeout):
		slog.Warn("Stage 1 timed out: Natural exit window exceeded", "streamId", p.StreamID)
		return false
	}
}

func (p *StreamProcess) requestGracefulStop(timeout time.Duration) bool {
	slog.Info("Stage 2: Requesting graceful stop via 'q'", "streamId", p.StreamID)

	if p.stdin != nil {
		_, _ = p.stdin.Write([]byte("q\n"))
	}

	select {
	case <-p.done:
		slog.Info("Shutdown successful: Stream stopped gracefully via 'q'", "streamId", p.StreamID)
		return true
	case <-time.After(timeout):
		slog.Warn("Stage 2 timed out: Graceful signal 'q' had no effect", "streamId", p.StreamID)
		return false
	}
}

func (p *StreamProcess) terminateForcibly() error {
	slog.Warn("Stage 3: Forcing hard termination (Kill)", "streamId", p.StreamID)

	p.cancel()
	var killErr error
	if p.cmd.Process != nil {
		killErr = p.cmd.Process.Kill()
	}

	select {
	case <-p.done:
		slog.Info("Shutdown successful: Process killed", "streamId", p.StreamID)
		return nil
	case <-time.After(time.Second):
		if killErr != nil {
			slog.Error("Shutdown failed: Kill attempt returned error", "streamId", p.StreamID, "err", killErr)
			return killErr
		}
		slog.Error("Shutdown failed: Process still alive after kill", "streamId", p.StreamID)
		return context.DeadlineExceeded
	}
}

func (p *StreamProcess) Done() <-chan struct{} {
	return p.done
}

func (p *StreamProcess) Error() error {
	return p.exitErr
}

func (p *StreamProcess) IsManualStop() bool {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.manualStop
}
