package ffmpeg

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/storage/minio"
)

const (
	liveBufferSegments = 30
)

type SegmentTracker struct {
	ctx       context.Context
	streamID  string
	streamDir string
	queries   *stream.Queries
	storage   *minio.Service

	mu               sync.RWMutex
	lastSegmentSeq   int
	uploadedSeq      int
	firstSegUploaded bool
	segmentDuration  float64
	metaInitialized  bool
}

func NewSegmentTracker(
	ctx context.Context,
	streamID, streamDir string,
	queries *stream.Queries,
	storage *minio.Service,
) *SegmentTracker {
	return &SegmentTracker{
		ctx:             ctx,
		streamID:        streamID,
		streamDir:       streamDir,
		queries:         queries,
		storage:         storage,
		lastSegmentSeq:  -1,
		uploadedSeq:     -1,
		segmentDuration: 2.0,
		metaInitialized: false,
	}
}

func (st *SegmentTracker) Run() {
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	slog.Info("Segment tracker started", "streamId", st.streamID, "streamDir", st.streamDir)

	for {
		select {
		case <-st.ctx.Done():
			st.finalizeStream()
			return
		case <-ticker.C:
			st.scanAndUpload()
		}
	}
}

func (st *SegmentTracker) scanAndUpload() {
	if !st.metaInitialized {
		st.initializeMetadata()
	}

	initMatches, _ := filepath.Glob(filepath.Join(st.streamDir, "init-*.mp4"))
	for _, path := range initMatches {
		if st.isFileStable(path) {
			filename := filepath.Base(path)
			remotePath := fmt.Sprintf("streams/%s/%s", st.streamID, filename)
			if err := st.storage.UploadFile(context.Background(), path, remotePath, "video/mp4"); err == nil {
				slog.Info("Uploaded init segment", "file", filename)
			}
		}
	}

	chunkPattern := filepath.Join(st.streamDir, "chunk-*-*.m4s")
	chunkMatches, err := filepath.Glob(chunkPattern)
	if err != nil {
		slog.Error("Failed to glob chunks", "error", err)
		return
	}

	for _, path := range chunkMatches {
		if !st.isFileStable(path) {
			continue
		}

		filename := filepath.Base(path)
		repId, seq := st.parseChunkName(filename)

		if seq == 1 && !st.firstSegUploaded {
			if err := st.queries.SetStreamStarted(context.Background(), st.streamID); err != nil {
				slog.Error("Failed to set stream startedAt", "err", err)
			} else {
				slog.Info("Stream started (first segment)", "streamId", st.streamID)
				st.firstSegUploaded = true
			}
		}

		remotePath := fmt.Sprintf("streams/%s/%s", st.streamID, filename)
		if err := st.storage.UploadFile(context.Background(), path, remotePath, "video/iso.segment"); err != nil {
			slog.Error("Failed to upload chunk", "file", path, "error", err)
			continue
		}

		slog.Info("Uploaded segment", "repId", repId, "seq", seq)

		st.mu.Lock()
		if seq > st.lastSegmentSeq {
			st.lastSegmentSeq = seq
		}
		if seq > st.uploadedSeq {
			st.uploadedSeq = seq
		}
		st.mu.Unlock()

		if seq%5 == 0 {
			st.updateMetadata()
		}
	}

	st.cleanupOldLocalChunks()
}

func (st *SegmentTracker) initializeMetadata() {
	_, err := st.queries.GetStreamMeta(context.Background(), st.streamID)

	if errors.Is(err, sql.ErrNoRows) {
		err = st.queries.CreateStreamMeta(context.Background(), stream.CreateStreamMetaParams{
			ID:              st.streamID,
			StreamId:        st.streamID,
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        sql.NullString{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		})

		if err != nil {
			slog.Error("Failed to create stream meta", "error", err)
		} else {
			st.metaInitialized = true
			slog.Info("Stream metadata initialized", "streamId", st.streamID)
		}
	} else if err == nil {
		st.metaInitialized = true
	}
}

func (st *SegmentTracker) updateMetadata() {
	st.mu.RLock()
	lastSeq := st.lastSegmentSeq
	st.mu.RUnlock()

	totalDuration := float64(lastSeq+1) * st.segmentDuration
	segmentCount := lastSeq + 1

	err := st.queries.UpdateStreamMetaWithSegments(
		context.Background(),
		stream.UpdateStreamMetaWithSegmentsParams{
			StreamId:        st.streamID,
			TotalDuration:   totalDuration,
			SegmentCount:    sql.NullInt32{Valid: true, Int32: int32(segmentCount)},
			LastSegmentSeq:  sql.NullInt32{Valid: true, Int32: int32(lastSeq)},
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        sql.NullString{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		},
	)

	if err != nil {
		slog.Error("Failed to update stream meta", "error", err)
	}
}

func (st *SegmentTracker) finalizeStream() {
	st.scanAndUpload()

	st.mu.RLock()
	totalDuration := float64(st.lastSegmentSeq) * st.segmentDuration
	segmentCount := st.lastSegmentSeq
	st.mu.RUnlock()

	_, err := st.queries.GetStreamMeta(context.Background(), st.streamID)

	if err == sql.ErrNoRows {
		err = st.queries.CreateStreamMeta(context.Background(), stream.CreateStreamMetaParams{
			ID:              st.streamID,
			StreamId:        st.streamID,
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        sql.NullString{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		})
		if err != nil {
			slog.Error("Failed to create stream meta during finalization", "error", err)
		}
	} else if err != nil {
		slog.Error("Failed to check stream meta existence", "error", err)
	}

	err = st.queries.UpdateStreamMetaWithSegments(
		context.Background(),
		stream.UpdateStreamMetaWithSegmentsParams{
			StreamId:        st.streamID,
			TotalDuration:   totalDuration,
			SegmentCount:    sql.NullInt32{Valid: true, Int32: int32(segmentCount)},
			LastSegmentSeq:  sql.NullInt32{Valid: true, Int32: int32(st.lastSegmentSeq)},
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        sql.NullString{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		},
	)

	if err != nil {
		slog.Error("Failed to update stream meta", "error", err)
	}

	slog.Info("Stream finalized",
		"streamId", st.streamID,
		"segments", segmentCount,
		"duration", totalDuration,
	)
}

func (st *SegmentTracker) parseChunkName(filename string) (rid int, seq int) {
	_, _ = fmt.Sscanf(filename, "chunk-%d-%d.m4s", &rid, &seq)
	return
}

func (st *SegmentTracker) isFileStable(path string) bool {
	i1, err := os.Stat(path)
	if err != nil {
		return false
	}

	time.Sleep(100 * time.Millisecond)

	i2, err := os.Stat(path)
	if err != nil {
		return false
	}

	return i1.Size() == i2.Size() &&
		i1.ModTime().Equal(i2.ModTime()) &&
		i2.Size() > 0
}

func (st *SegmentTracker) GetLastSegment() int {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return st.lastSegmentSeq
}

func (st *SegmentTracker) GetUploadedSeq() int {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return st.uploadedSeq
}

func (st *SegmentTracker) cleanupOldLocalChunks() {
	st.mu.RLock()
	uploadedSeq := st.uploadedSeq
	lastSeq := st.lastSegmentSeq
	st.mu.RUnlock()

	if uploadedSeq <= 0 || lastSeq <= 0 {
		return
	}

	deleteBeforeSeq := lastSeq - liveBufferSegments
	if deleteBeforeSeq <= 0 {
		return
	}

	if deleteBeforeSeq > uploadedSeq {
		deleteBeforeSeq = uploadedSeq
	}

	chunkPattern := filepath.Join(st.streamDir, "chunk-*-*.m4s")
	matches, err := filepath.Glob(chunkPattern)
	if err != nil {
		return
	}

	var toDelete []string
	for _, path := range matches {
		filename := filepath.Base(path)
		_, seq := st.parseChunkName(filename)
		if seq > 0 && seq < deleteBeforeSeq {
			toDelete = append(toDelete, path)
		}
	}

	sort.Strings(toDelete)
	for _, path := range toDelete {
		if err := os.Remove(path); err == nil {
			slog.Debug("Cleaned up old local chunk", "path", filepath.Base(path))
		}
	}
}
