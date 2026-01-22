package ffmpeg

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"
)

const (
	GracefulShutdownTimeout   = time.Minute
	WaitForNaturalExitTimeout = 5 * time.Minute
)

type StreamProcess struct {
	StreamID  string
	cmd       *exec.Cmd
	ctx       context.Context
	cancel    context.CancelFunc
	outputDir string

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

func NewStreamProcess(streamID string, rtmp string, outputDir, env string) (*StreamProcess, error) {
	ctx, cancel := context.WithCancel(context.Background())
	streamDir := GetStreamDirectory(outputDir, streamID)

	var cmd *exec.Cmd

	if env == "production" {
		cmd = BuildCommandContextProd(ctx, rtmp, streamDir)
	} else {
		cmd = BuildCommandContextTest(ctx, rtmp, streamDir)
	}

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
	}

	go proc.monitor()
	go proc.maintainLivePlaylist()

	return proc, nil
}

func (p *StreamProcess) monitor() {
	p.exitErr = p.cmd.Wait()

	p.cancel()

	p.finalizePlaylist("dvr.m3u8")

	close(p.done)

	slog.Info("FFmpeg process exited",
		"streamId", p.StreamID,
		"manualStop", p.manualStop,
		"error", p.exitErr,
		"stderr", p.stderr.String(),
	)
}

func (p *StreamProcess) finalizePlaylist(namefile string) {
	streamDir := GetStreamDirectory(p.outputDir, p.StreamID)
	path := filepath.Join(streamDir, namefile)

	if !playlistHasEndlist(path) {
		p.appendEndlist(path)
	}
}

func (p *StreamProcess) maintainLivePlaylist() {
	streamDir := GetStreamDirectory(p.outputDir, p.StreamID)
	dvrPath := filepath.Join(streamDir, "dvr.m3u8")
	livePath := filepath.Join(streamDir, "live.m3u8")

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-p.ctx.Done():
			p.finalizePlaylist("live.m3u8")
			return
		case <-ticker.C:
			p.syncLivePlaylist(dvrPath, livePath)
		}
	}
}

func (p *StreamProcess) syncLivePlaylist(dvrPath, livePath string) {
	content, err := os.ReadFile(dvrPath)
	if err != nil {
		return
	}

	lines := bytes.Split(content, []byte("\n"))
	var header []string
	var segments []struct {
		inf  string
		path string
	}

	parsingHeader := true
	var lastInf string
	for _, line := range lines {
		line = bytes.TrimSpace(line)
		if len(line) == 0 {
			continue
		}

		if bytes.HasPrefix(line, []byte("#EXTINF:")) {
			parsingHeader = false
			lastInf = string(line)
		} else if !bytes.HasPrefix(line, []byte("#")) {
			if lastInf != "" {
				segments = append(segments, struct {
					inf  string
					path string
				}{lastInf, string(line)})
				lastInf = ""
			}
		} else if parsingHeader {
			tag := string(line)
			if !bytes.HasPrefix(line, []byte("#EXT-X-MEDIA-SEQUENCE")) &&
				!bytes.HasPrefix(line, []byte("#EXT-X-PLAYLIST-TYPE")) {
				header = append(header, tag)
			}
		}
	}

	if len(segments) == 0 {
		return
	}

	windowSize := 3
	startIdx := 0
	if len(segments) > windowSize {
		startIdx = len(segments) - windowSize
	}
	liveSegments := segments[startIdx:]

	var buf bytes.Buffer
	for _, h := range header {
		buf.WriteString(h + "\n")
	}
	buf.WriteString(fmt.Sprintf("#EXT-X-MEDIA-SEQUENCE:%d\n", startIdx))

	for _, seg := range liveSegments {
		buf.WriteString(seg.inf + "\n")
		buf.WriteString(seg.path + "\n")
	}

	tmpPath := livePath + ".tmp"
	if err := os.WriteFile(tmpPath, buf.Bytes(), 0644); err == nil {
		_ = os.Rename(tmpPath, livePath)
	}
}

func (p *StreamProcess) appendEndlist(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return
	}
	f, err := os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	_, _ = f.WriteString("\n#EXT-X-ENDLIST\n")
}

func playlistHasEndlist(path string) bool {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}
	f, err := os.Open(path)
	if err != nil {
		return false
	}
	defer f.Close()

	buf := make([]byte, 4096)
	stat, err := f.Stat()
	if err != nil {
		return false
	}

	size := stat.Size()
	if size > int64(len(buf)) {
		f.Seek(-int64(len(buf)), io.SeekEnd)
	}

	n, _ := f.Read(buf)
	return bytes.Contains(buf[:n], []byte("#EXT-X-ENDLIST"))
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
