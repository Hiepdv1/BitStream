package manager

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/domain/streaming/ffmpeg"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
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
		slog.Warn("Stream already running, force stopping to restart", "streamId", p.StreamID)
		if err := m.cleanupProcess(p.StreamID); err != nil {
			slog.Error("Failed to cleanup old stream", "streamId", p.StreamID, "error", err)
			return err
		}
	} else if m.isProbing(p.StreamID) {
		m.mu.Unlock()
		slog.Warn("Stream probe already in progress, skipping duplicate", "streamId", p.StreamID)
		return nil
	} else {
		m.mu.Unlock()
	}

	probeCtx, cancel := context.WithCancel(m.ctx)
	m.setProbing(p.StreamID, true, cancel)

	m.wg.Add(1)
	go m.probeAndStart(p, probeCtx)

	slog.Info("Stream probe+start launched (non-blocking)", "streamId", p.StreamID)
	return nil
}

func (m *StreamManager) probeAndStart(p model.StreamPayload, probeCtx context.Context) {
	defer m.wg.Done()
	defer m.setProbing(p.StreamID, false, nil)

	slog.Info("Phase 1: Probing stream with ffprobe", "streamId", p.StreamID)

	probeResult, err := ffmpeg.ProbeStreamWithRetry(probeCtx, p.RTMPUrl, p.StreamID)
	if err != nil {
		slog.Error("ffprobe failed after retries", "streamId", p.StreamID, "error", err)
		m.attemptRetry(p, fmt.Errorf("probe failed: %w", err))
		return
	}

	ladders := ffmpeg.ComputeLadders(probeResult.Height)
	slog.Info("Phase 2: Computed resolution ladders",
		"streamId", p.StreamID,
		"sourceWidth", probeResult.Width,
		"sourceHeight", probeResult.Height,
		"ladders", ladders,
	)

	m.saveResolution(p.StreamID, probeResult, ladders)

	slog.Info("Phase 3: Starting FFmpeg process", "streamId", p.StreamID, "ladders", ladders)

	proc, err := ffmpeg.NewStreamProcess(
		p.StreamID,
		p.RTMPUrl,
		m.config.FFmpeg.OutputDir,
		m.config.Env,
		m.queries,
		m.storage,
		p.IsRetry,
		ladders,
		m.config.FFmpeg.CdnBaseURL,
		probeResult.FPS,
	)
	if err != nil {
		slog.Error("Failed to start FFmpeg process", "streamId", p.StreamID, "error", err)
		m.attemptRetry(p, fmt.Errorf("ffmpeg start failed: %w", err))
		return
	}

	m.mu.Lock()
	m.process[p.StreamID] = proc
	m.mu.Unlock()

	slog.Info("Stream fully started",
		"streamId", p.StreamID,
		"ladders", ladders,
		"source", fmt.Sprintf("%dx%d", probeResult.Width, probeResult.Height),
	)

	m.monitorProcess(p, proc)

}

func (m *StreamManager) saveResolution(streamID string, probe *ffmpeg.ProbeResult, ladders []int) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	laddersJSON, err := json.Marshal(ladders)
	if err != nil {
		slog.Error("Failed to marshal ladders", "streamId", streamID, "error", err)
		return
	}

	_, err = m.queries.GetStreamMeta(ctx, streamID)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			slog.Error("Failed to check StreamMeta existence", "streamId", streamID, "error", err)
			return
		}
		slog.Warn("StreamMeta not found, creating before saving resolution", "streamId", streamID)
		createErr := m.queries.CreateStreamMeta(ctx, stream.CreateStreamMetaParams{
			ID:              streamID,
			StreamId:        streamID,
			SegmentDuration: int32(ffmpeg.SegDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        pgtype.Text{Valid: true, String: fmt.Sprintf("streams/%s", streamID)},
		})
		if createErr != nil {
			slog.Error("Failed to create StreamMeta for resolution save", "streamId", streamID, "error", createErr)
			return
		}
	}

	err = m.queries.UpdateStreamResolution(ctx, stream.UpdateStreamResolutionParams{
		StreamId:     streamID,
		SourceWidth:  pgtype.Int4{Valid: true, Int32: int32(probe.Width)},
		SourceHeight: pgtype.Int4{Valid: true, Int32: int32(probe.Height)},
		Ladders:      laddersJSON,
	})

	if err != nil {
		slog.Error("Failed to save stream resolution", "streamId", streamID, "error", err)
	} else {
		slog.Info("Saved stream resolution to DB",
			"streamId", streamID,
			"width", probe.Width,
			"height", probe.Height,
			"ladders", ladders,
		)
	}
}

func (m *StreamManager) stopStream(p model.StreamPayload) error {
	m.cancelProbe(p.StreamID)
	m.setProbing(p.StreamID, false, nil)
	return m.cleanupProcess(p.StreamID)
}

func (m *StreamManager) monitorProcess(p model.StreamPayload, proc *ffmpeg.StreamProcess) {
	<-proc.Done()

	if proc.IsManualStop() {
		slog.Info("Stream stopped intentionally", "streamId", p.StreamID)
		m.cleanupProcess(p.StreamID)
		return
	}

	err := proc.Error()

	m.cleanupProcess(p.StreamID)

	m.attemptRetry(p, err)
}

func (m *StreamManager) attemptRetry(p model.StreamPayload, reason error) {
	if p.Action == model.StreamStop {
		return
	}

	slog.Error("Stream process exited unexpectedly", "streamId", p.StreamID, "error", reason)

	if p.RetryCount >= p.MaxRetry {
		slog.Error("Max retries reached, giving up", "streamId", p.StreamID)
		_ = m.cleanupProcess(p.StreamID)
		return
	}

	p.RetryCount++
	delay := min(time.Duration(p.RetryCount)*2*time.Second, 30*time.Second)

	slog.Info("Scheduling retry", "streamId", p.StreamID, "retryCount", p.RetryCount, "delay", delay)

	time.Sleep(delay)

	p.IsRetry = true

	m.Dispatch(p)
}

func (m *StreamManager) cleanupProcess(streamID string) error {
	m.mu.Lock()
	proc, ok := m.process[streamID]
	if ok {
		delete(m.process, streamID)
	}

	m.setProbing(streamID, false, nil)

	m.mu.Unlock()

	if !ok {
		return nil
	}

	slog.Info("Cleaning up stream process", "streamId", streamID)
	return proc.Stop()
}
