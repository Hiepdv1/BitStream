package manager

import (
	"context"
	"log/slog"
	"os"
	"path/filepath"
	"time"

	stream "github.com/bitstream/backend-go/internal/db/generated"
)

const (
	gcInterval     = 1 * time.Minute
	gcCleanupAfter = 10 * time.Minute
)

type GarbageCollector struct {
	ctx       context.Context
	cancel    context.CancelFunc
	queries   *stream.Queries
	outputDir string
}

func NewGarbageCollector(queries *stream.Queries, outputDir string) *GarbageCollector {
	ctx, cancel := context.WithCancel(context.Background())
	return &GarbageCollector{
		ctx:       ctx,
		cancel:    cancel,
		queries:   queries,
		outputDir: outputDir,
	}
}

func (gc *GarbageCollector) Run() {
	ticker := time.NewTicker(gcInterval)
	defer ticker.Stop()

	slog.Info("Garbage collector started", "interval", gcInterval, "outputDir", gc.outputDir)

	for {
		select {
		case <-gc.ctx.Done():
			slog.Info("Garbage collector stopped")
			return
		case <-ticker.C:
			gc.collect()
		}
	}
}

func (gc *GarbageCollector) Stop() {
	gc.cancel()
}

func (gc *GarbageCollector) collect() {
	localStreamIDs := gc.scanLocalStreams()
	if len(localStreamIDs) == 0 {
		return
	}

	slog.Info("GC: Found local stream directories", "count", len(localStreamIDs))

	for _, streamID := range localStreamIDs {
		if gc.shouldCleanup(streamID) {
			gc.cleanupStreamDirectory(streamID)
		}
	}
}

func (gc *GarbageCollector) scanLocalStreams() []string {
	entries, err := os.ReadDir(gc.outputDir)
	if err != nil {
		slog.Error("GC: Failed to read output directory", "error", err)
		return nil
	}

	var streamIDs []string
	for _, entry := range entries {
		if entry.IsDir() {
			streamIDs = append(streamIDs, entry.Name())
		}
	}
	return streamIDs
}

func (gc *GarbageCollector) shouldCleanup(streamID string) bool {
	s, err := gc.queries.GetStreamByID(context.Background(), streamID)
	if err != nil {
		slog.Info("GC: Stream not found in DB, cleaning up", "streamId", streamID)
		return true
	}

	if s.IsLive {
		return false
	}

	if s.EndedAt.Valid {
		endedAgo := time.Since(s.EndedAt.Time)
		if endedAgo > gcCleanupAfter {
			slog.Info("GC: Stream ended, ready for cleanup",
				"streamId", streamID,
				"endedAgo", endedAgo.Round(time.Second),
			)
			return true
		}
	}

	return false
}

func (gc *GarbageCollector) cleanupStreamDirectory(streamID string) {
	streamDir := filepath.Join(gc.outputDir, streamID)

	if _, err := os.Stat(streamDir); os.IsNotExist(err) {
		return
	}

	patterns := []string{
		"manifest.mpd",
		"manifest.mpd.tmp",
		"init-*.mp4",
		"chunk-*.m4s",
	}

	for _, pattern := range patterns {
		matches, _ := filepath.Glob(filepath.Join(streamDir, pattern))
		for _, path := range matches {
			if err := os.Remove(path); err == nil {
				slog.Info("GC: Removed file", "path", path)
			}
		}
	}

	for _, subdir := range []string{"internal", "public"} {
		subdirPath := filepath.Join(streamDir, subdir)
		_ = os.Remove(subdirPath)
	}

	if err := os.Remove(streamDir); err == nil {
		slog.Info("GC: Cleaned up stream directory", "streamId", streamID)
	}
}
