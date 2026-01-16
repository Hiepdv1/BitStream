package manager

import (
	"errors"
	"log/slog"
	"time"

	"github.com/bitstream/backend-go/internal/domain/streaming/ffmpeg"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
)

func (m *StreamManager) handlePayload(p model.StreamPayload) {
	var err error

	switch p.Action {
	case model.StreamStart:
		err = m.startStream(p)
	case model.StreamStop:
		err = m.stopStream(p)
	default:
		slog.Warn("Unknown action", "action", p.Action, "streamId", p.StreamID)
		return
	}

	if err != nil {
		slog.Error("Failed to handle stream action", "action", p.Action, "error", err, "streamId", p.StreamID)
		m.attemptRetry(p, err)
	}
}

func (m *StreamManager) startStream(p model.StreamPayload) error {
	m.mu.Lock()
	if _, exists := m.process[p.StreamID]; exists {
		m.mu.Unlock()
		slog.Info("Stream already running", "streamId", p.StreamID)
		return nil
	}
	m.mu.Unlock()

	proc, err := ffmpeg.NewStreamProcess(p.StreamID, p.RTMPUrl)
	if err != nil {
		return err
	}

	m.mu.Lock()
	m.process[p.StreamID] = proc
	m.mu.Unlock()

	slog.Info("Stream process started", "streamId", p.StreamID)

	m.wg.Add(1)
	go m.monitorProcess(p, proc)

	return nil
}

func (m *StreamManager) stopStream(p model.StreamPayload) error {
	return m.cleanupProcess(p.StreamID)
}

func (m *StreamManager) monitorProcess(p model.StreamPayload, proc *ffmpeg.StreamProcess) {
	defer m.wg.Done()

	err := proc.Cmd.Wait()

	select {
	case <-proc.Ctx.Done():
		slog.Info("Stream stopped cleanly (context cancelled)", "streamId", p.StreamID)
		return
	default:
	}

	if err != nil {
		slog.Error("Stream process exited with error", "streamId", p.StreamID, "error", err)
	} else {
		slog.Info("Stream process exited unexpectedly (zero code)", "streamId", p.StreamID)
	}

	_ = m.cleanupProcess(p.StreamID)

	m.attemptRetry(p, errors.New("process crashed"))
}

func (m *StreamManager) attemptRetry(p model.StreamPayload, reason error) {
	if p.Action == model.StreamStop {
		return
	}

	if p.RetryCount >= p.MaxRetry {
		slog.Error("Max retries reached, giving up", "streamId", p.StreamID)
		_ = m.cleanupProcess(p.StreamID)
		return
	}

	p.RetryCount++
	delay := time.Duration(p.RetryCount) * 2 * time.Second
	if delay > 30*time.Second {
		delay = 30 * time.Second
	}

	slog.Info("Scheduling retry", "streamId", p.StreamID, "retryCount", p.RetryCount, "delay", delay)

	time.Sleep(delay)
	m.Dispatch(p)
}

func (m *StreamManager) cleanupProcess(streamID string) error {
	m.mu.Lock()
	proc, ok := m.process[streamID]
	if ok {
		delete(m.process, streamID)
	}
	m.mu.Unlock()

	if !ok {
		return nil
	}

	slog.Info("Cleaning up stream process", "streamId", streamID)
	return proc.Kill()
}
