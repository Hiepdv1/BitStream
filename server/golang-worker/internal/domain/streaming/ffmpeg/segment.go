package ffmpeg

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/storage/minio"
	"github.com/fsnotify/fsnotify"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	liveBufferSegments = 30
	safetyBuffer       = 5
	minCleanupAge      = 15 * time.Second

	debounceDuration     = 50 * time.Millisecond
	enqueueTimeout       = 2 * time.Second
	reconcileInterval    = 5 * time.Second
	maxReconcileEnqueue  = 20
	pruneWindowSize      = 100
	uploadQueueCap       = 100
	cleanupEveryNChunks  = 10
	metadataEveryNChunks = 5
)

type uploadJob struct {
	localPath   string
	remotePath  string
	contentType string
	segSeq      int
	repID       int
	jobType     string
}

type SegmentTracker struct {
	ctx       context.Context
	proc      *StreamProcess
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
	isRetry          bool
	cdnBaseURL       string

	// Upload pipeline
	uploadChan    chan uploadJob
	debouncer     *FileDebouncer
	uploadedInits map[string]bool
	uploadedSegs  map[string]bool
	trackedFiles  map[string]int
	wg            sync.WaitGroup
	workerCount   int
}

func NewSegmentTracker(
	ctx context.Context,
	proc *StreamProcess,
	streamID, streamDir string,
	queries *stream.Queries,
	storage *minio.Service,
	isRetry bool,
	cdnBaseURL string,
	workerCount int,
) *SegmentTracker {
	if workerCount <= 0 {
		workerCount = 3
	}

	st := &SegmentTracker{
		ctx:             ctx,
		proc:            proc,
		streamID:        streamID,
		streamDir:       streamDir,
		queries:         queries,
		storage:         storage,
		lastSegmentSeq:  -1,
		uploadedSeq:     -1,
		segmentDuration: float64(SegDuration),
		metaInitialized: false,
		isRetry:         isRetry,
		cdnBaseURL:      cdnBaseURL,
		workerCount:     workerCount,
		uploadChan:      make(chan uploadJob, uploadQueueCap),
		uploadedInits:   make(map[string]bool),
		uploadedSegs:    make(map[string]bool),
		trackedFiles:    make(map[string]int),
	}

	st.debouncer = NewFileDebouncer(debounceDuration, st.enqueueUpload)

	return st
}

// ===============================
// MAIN RUN LOOP
// ===============================

func (st *SegmentTracker) Run() {
	// Start upload workers
	for i := 0; i < st.workerCount; i++ {
		st.wg.Add(1)
		go st.uploadWorker()
	}

	// Setup fsnotify watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		slog.Error("Failed to create fsnotify watcher", "streamId", st.streamID, "error", err)
		return
	}
	defer watcher.Close()

	if err := watcher.Add(st.streamDir); err != nil {
		slog.Error("Failed to watch stream dir", "streamId", st.streamID, "dir", st.streamDir, "error", err)
		return
	}

	// Startup scan — catch files created before watcher attached
	st.scanExistingFiles()

	// Periodic reconciliation — backup for fsnotify misses
	reconcileTicker := time.NewTicker(reconcileInterval)
	defer reconcileTicker.Stop()

	slog.Info("Segment tracker started",
		"streamId", st.streamID,
		"workers", st.workerCount,
		"streamDir", st.streamDir,
	)

	// Event loop
	for {
		select {
		case <-st.ctx.Done():
			if st.proc != nil && st.proc.IsAborted() {
				slog.Warn("ABORT: Skipping finalization — stream was aborted", "streamId", st.streamID)
				st.debouncer.Close()
				close(st.uploadChan)
				st.wg.Wait()
			} else {
				st.drainAndFinalize()
			}
			return

		case event := <-watcher.Events:
			if event.Op&(fsnotify.Create|fsnotify.Write) != 0 {
				st.debouncer.Trigger(event.Name)
			}

		case err := <-watcher.Errors:
			slog.Error("fsnotify error", "streamId", st.streamID, "error", err)

		case <-reconcileTicker.C:
			st.reconcile()
		}
	}
}

// ===============================
// FILE DETECTION
// ===============================

// scanExistingFiles scans the stream directory for any files that may
// have been created before the fsnotify watcher was attached.
// Also used during shutdown to catch remaining files.
func (st *SegmentTracker) scanExistingFiles() {
	if !st.metaInitialized && !st.isRetry {
		st.initializeMetadata()
	}

	entries, err := os.ReadDir(st.streamDir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if (strings.HasPrefix(name, "init-") && strings.HasSuffix(name, ".mp4")) ||
			(strings.HasPrefix(name, "chunk-") && strings.HasSuffix(name, ".m4s")) {
			st.enqueueUpload(filepath.Join(st.streamDir, name))
		}
	}
}

// reconcile performs a rate-limited scan to catch any segments
// that fsnotify may have missed under high load.
func (st *SegmentTracker) reconcile() {
	if !st.metaInitialized && !st.isRetry {
		st.initializeMetadata()
	}

	enqueued := 0

	entries, err := os.ReadDir(st.streamDir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		if enqueued >= maxReconcileEnqueue {
			break
		}
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if (strings.HasPrefix(name, "init-") && strings.HasSuffix(name, ".mp4")) ||
			(strings.HasPrefix(name, "chunk-") && strings.HasSuffix(name, ".m4s")) {

			if st.tryEnqueue(filepath.Join(st.streamDir, name)) {
				enqueued++
			}
		}
	}

	if enqueued > 0 {
		slog.Debug("Reconciliation enqueued segments",
			"streamId", st.streamID,
			"count", enqueued,
		)
	}
}

func (st *SegmentTracker) tryEnqueue(path string) bool {
	filename := filepath.Base(path)

	st.mu.RLock()
	already := st.uploadedSegs[filename] || st.uploadedInits[filename]
	st.mu.RUnlock()

	if already {
		return false
	}

	st.enqueueUpload(path)
	return true
}

// ===============================
// FILE STABILITY CHECK
// ===============================

// verifyFileStable uses a 3-layer heuristic to check if a file
// has been completely written by FFmpeg.
//
// minSize varies by file type:
//   - init segments (~400-900 bytes): minSize = 100
//   - media chunks (~50-500KB):       minSize = 1024
//
// This is a heuristic, NOT a guarantee. OS buffer/flush is not deterministic.
func (st *SegmentTracker) verifyFileStable(path string, minSize int64) bool {
	stat1, err := os.Stat(path)
	if err != nil {
		return false
	}

	// Layer 1: size threshold — file too small is definitely incomplete
	if stat1.Size() < minSize {
		return false
	}

	// Layer 2: time guard — if file was modified less than 50ms ago,
	// OS may not have flushed buffers yet
	if time.Since(stat1.ModTime()) < 50*time.Millisecond {
		return false
	}

	// Layer 3: stability check — size + modTime unchanged after 20ms
	time.Sleep(20 * time.Millisecond)

	stat2, err := os.Stat(path)
	if err != nil {
		return false
	}

	return stat1.Size() == stat2.Size() &&
		stat1.ModTime().Equal(stat2.ModTime())
}

// ===============================
// ENQUEUE
// ===============================

func (st *SegmentTracker) enqueueUpload(path string) {
	filename := filepath.Base(path)

	// Skip manifest + tmp files — nginx serves manifest directly from disk
	if strings.HasSuffix(filename, ".mpd") || strings.HasSuffix(filename, ".tmp") {
		return
	}

	// Skip already tracked
	st.mu.RLock()
	already := st.uploadedSegs[filename] || st.uploadedInits[filename]
	st.mu.RUnlock()
	if already {
		return
	}

	// Classify file type FIRST, then apply appropriate stability check
	var job uploadJob
	var minSize int64

	switch {
	case strings.HasPrefix(filename, "init-") && strings.HasSuffix(filename, ".mp4"):
		job = uploadJob{
			localPath:   path,
			remotePath:  fmt.Sprintf("streams/%s/%s", st.streamID, filename),
			contentType: "video/mp4",
			jobType:     "init",
			segSeq:      -1,
		}
		minSize = 100 // init segments are small (~400-900 bytes, just ftyp+moov)

	case strings.HasPrefix(filename, "chunk-") && strings.HasSuffix(filename, ".m4s"):
		repID, seq := st.parseChunkName(filename)
		job = uploadJob{
			localPath:   path,
			remotePath:  fmt.Sprintf("streams/%s/%s", st.streamID, filename),
			contentType: "video/iso.segment",
			segSeq:      seq,
			repID:       repID,
			jobType:     "chunk",
		}
		minSize = 1024 // media chunks are always >1KB (~50-500KB)

	default:
		return
	}

	// Verify file is stable — only for chunks (init files are tiny, written once atomically)
	// Init segments: debounce 50ms alone is sufficient (file is ~700 bytes, written instantly)
	// Chunks: need stability check because they're larger and written over multiple IO ops
	if job.jobType == "chunk" && !st.verifyFileStable(path, minSize) {
		return
	}

	// For init files, just verify the file exists and has data
	if job.jobType == "init" {
		stat, err := os.Stat(path)
		if err != nil || stat.Size() == 0 {
			return
		}
	}

	// Mark as queued BEFORE pushing — prevents duplicate from reconciliation
	st.mu.Lock()
	st.uploadedSegs[filename] = true
	st.mu.Unlock()

	// Context-aware blocking send — NO busy loop
	// If queue full, block up to 2s. On timeout, unmark so reconciliation retries.
	enqueueCtx, cancel := context.WithTimeout(st.ctx, enqueueTimeout)
	defer cancel()

	select {
	case st.uploadChan <- job:
		// queued OK
	case <-enqueueCtx.Done():
		slog.Warn("Enqueue timeout, will retry via reconciliation",
			"streamId", st.streamID,
			"file", filename,
			"timeout", enqueueTimeout,
		)
		st.mu.Lock()
		delete(st.uploadedSegs, filename)
		st.mu.Unlock()
	}
}

// ===============================
// UPLOAD WORKERS
// ===============================

func (st *SegmentTracker) uploadWorker() {
	defer st.wg.Done()

	for job := range st.uploadChan {
		st.processUploadJob(job)
	}
}

func (st *SegmentTracker) processUploadJob(job uploadJob) {
	file, err := os.Open(job.localPath)
	if err != nil {
		slog.Error("Failed to open segment",
			"streamId", st.streamID,
			"path", job.localPath,
			"error", err,
		)
		st.unmarkSeg(job.localPath)
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil || stat.Size() == 0 {
		slog.Error("Invalid segment file",
			"streamId", st.streamID,
			"path", job.localPath,
		)
		st.unmarkSeg(job.localPath)
		return
	}

	var uploadErr error
	for attempt := range 3 {
		if attempt > 0 {
			file.Seek(0, io.SeekStart)
		}

		uploadErr = st.storage.UploadFromReader(
			context.Background(),
			file, stat.Size(),
			job.remotePath, job.contentType,
		)
		if uploadErr == nil {
			break
		}

		backoff := time.Duration(1<<attempt) * 200 * time.Millisecond
		slog.Warn("Upload retry",
			"streamId", st.streamID,
			"file", filepath.Base(job.localPath),
			"attempt", attempt+1,
			"backoff", backoff,
			"error", uploadErr,
		)
		time.Sleep(backoff)
	}

	if uploadErr != nil {
		slog.Error("Upload failed after retries",
			"streamId", st.streamID,
			"path", job.localPath,
			"error", uploadErr,
		)
		st.unmarkSeg(job.localPath)
		return
	}

	filename := filepath.Base(job.localPath)
	switch job.jobType {
	case "init":
		st.mu.Lock()
		st.uploadedInits[filename] = true
		st.mu.Unlock()
		slog.Info("Uploaded init segment",
			"streamId", st.streamID,
			"file", filename,
		)

	case "chunk":
		st.mu.Lock()
		if job.segSeq > st.lastSegmentSeq {
			st.lastSegmentSeq = job.segSeq
		}
		if job.segSeq > st.uploadedSeq {
			st.uploadedSeq = job.segSeq
		}
		st.trackedFiles[filename] = job.segSeq
		st.mu.Unlock()

		st.handleFirstSegment(job.segSeq)

		if job.segSeq%metadataEveryNChunks == 0 {
			st.updateMetadata()
		}
		if job.segSeq%cleanupEveryNChunks == 0 {
			st.cleanupOldLocalChunks()
			st.pruneTrackedState()
		}

		slog.Info("Uploaded segment",
			"streamId", st.streamID,
			"repId", job.repID,
			"seq", job.segSeq,
		)
	}
}

func (st *SegmentTracker) unmarkSeg(path string) {
	st.mu.Lock()
	delete(st.uploadedSegs, filepath.Base(path))
	st.mu.Unlock()
}

// ===============================
// FIRST SEGMENT HANDLING
// ===============================

func (st *SegmentTracker) handleFirstSegment(seq int) {
	if seq != 1 || st.firstSegUploaded {
		return
	}

	if st.isRetry {
		st.firstSegUploaded = true
		return
	}

	now := time.Now().UTC()
	err := st.queries.SetStreamStarted(context.Background(), stream.SetStreamStartedParams{
		ID:        st.streamID,
		StartedAt: pgtype.Timestamptz{Valid: true, Time: now},
	})
	if err != nil {
		slog.Error("Failed to set stream startedAt",
			"streamId", st.streamID,
			"err", err,
		)
	} else {
		st.firstSegUploaded = true
		slog.Info("Stream started (first segment)", "streamId", st.streamID)
	}
}

// ===============================
// METADATA
// ===============================

func (st *SegmentTracker) initializeMetadata() {
	_, err := st.queries.GetStreamMeta(context.Background(), st.streamID)

	if errors.Is(err, pgx.ErrNoRows) {
		err = st.queries.CreateStreamMeta(context.Background(), stream.CreateStreamMetaParams{
			ID:              st.streamID,
			StreamId:        st.streamID,
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        pgtype.Text{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		})

		if err != nil {
			slog.Error("Failed to create stream meta", "streamId", st.streamID, "error", err)
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
			SegmentCount:    pgtype.Int4{Valid: true, Int32: int32(segmentCount)},
			LastSegmentSeq:  pgtype.Int4{Valid: true, Int32: int32(lastSeq)},
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        pgtype.Text{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		},
	)

	if err != nil {
		slog.Error("Failed to update stream meta", "streamId", st.streamID, "error", err)
	}
}

// ===============================
// LOCAL CLEANUP (in-memory tracked, no Glob)
// ===============================

func (st *SegmentTracker) cleanupOldLocalChunks() {
	st.mu.RLock()
	uploadedSeq := st.uploadedSeq
	lastSeq := st.lastSegmentSeq
	st.mu.RUnlock()

	if uploadedSeq <= 0 || lastSeq <= 0 {
		return
	}

	deleteBeforeSeq := lastSeq - liveBufferSegments - safetyBuffer
	if deleteBeforeSeq <= 0 {
		return
	}
	if deleteBeforeSeq > uploadedSeq {
		deleteBeforeSeq = uploadedSeq
	}

	// Build candidate list from in-memory index — no Glob
	now := time.Now()

	st.mu.RLock()
	candidates := make(map[string]int, 0)
	for filename, seq := range st.trackedFiles {
		if seq > 0 && seq < deleteBeforeSeq {
			candidates[filename] = seq
		}
	}
	st.mu.RUnlock()

	for filename := range candidates {
		path := filepath.Join(st.streamDir, filename)

		info, err := os.Stat(path)
		if err != nil {
			// File already gone
			st.mu.Lock()
			delete(st.trackedFiles, filename)
			st.mu.Unlock()
			continue
		}

		// Age check — nginx/player may still be serving this file
		if now.Sub(info.ModTime()) < minCleanupAge {
			continue
		}

		if err := os.Remove(path); err == nil {
			slog.Debug("Cleaned up local chunk",
				"streamId", st.streamID,
				"file", filename,
			)
			st.mu.Lock()
			delete(st.trackedFiles, filename)
			st.mu.Unlock()
		}
	}
}

// pruneTrackedState removes old entries from uploadedSegs and trackedFiles
// to prevent memory leak during long streams.
func (st *SegmentTracker) pruneTrackedState() {
	st.mu.Lock()
	defer st.mu.Unlock()

	if st.lastSegmentSeq < pruneWindowSize {
		return
	}

	threshold := st.lastSegmentSeq - pruneWindowSize

	for filename := range st.uploadedSegs {
		_, s := st.parseChunkName(filename)
		if s > 0 && s < threshold {
			delete(st.uploadedSegs, filename)
		}
	}

	for filename, seq := range st.trackedFiles {
		if seq > 0 && seq < threshold {
			delete(st.trackedFiles, filename)
		}
	}
}

// ===============================
// SHUTDOWN
// ===============================

func (st *SegmentTracker) drainAndFinalize() {
	// 1. Flush pending debouncer timers
	st.debouncer.Close()

	// small delay to let flushed handlers enqueue
	time.Sleep(100 * time.Millisecond)

	// 2. Final scan — catch remaining files
	st.scanExistingFiles()

	// 3. Close upload channel → workers drain remaining jobs
	close(st.uploadChan)
	st.wg.Wait()

	// 4. Final metadata update
	st.mu.RLock()
	totalDuration := float64(st.lastSegmentSeq) * st.segmentDuration
	segmentCount := st.lastSegmentSeq
	st.mu.RUnlock()

	ctx := context.Background()

	_, err := st.queries.GetStreamMeta(ctx, st.streamID)
	if err == pgx.ErrNoRows {
		err = st.queries.CreateStreamMeta(ctx, stream.CreateStreamMetaParams{
			ID:              st.streamID,
			StreamId:        st.streamID,
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        pgtype.Text{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		})
		if err != nil {
			slog.Error("Failed to create stream meta during finalization",
				"streamId", st.streamID, "error", err)
		}
	} else if err != nil {
		slog.Error("Failed to check stream meta existence",
			"streamId", st.streamID, "error", err)
	}

	err = st.queries.UpdateStreamMetaWithSegments(
		ctx,
		stream.UpdateStreamMetaWithSegmentsParams{
			StreamId:        st.streamID,
			TotalDuration:   totalDuration,
			SegmentCount:    pgtype.Int4{Valid: true, Int32: int32(segmentCount)},
			LastSegmentSeq:  pgtype.Int4{Valid: true, Int32: int32(st.lastSegmentSeq)},
			SegmentDuration: int32(st.segmentDuration * 1000),
			Timescale:       1000,
			VideoRepId:      "0",
			AudioRepId:      "1",
			BasePath:        pgtype.Text{Valid: true, String: fmt.Sprintf("streams/%s", st.streamID)},
		},
	)
	if err != nil {
		slog.Error("Failed to update stream meta",
			"streamId", st.streamID, "error", err)
	}

	st.buildAndUploadVODManifest()

	err = st.queries.UpdateStreamLive(ctx, stream.UpdateStreamLiveParams{
		ID:     st.streamID,
		IsLive: false,
	})
	if err != nil {
		slog.Error("Failed to update stream live",
			"streamId", st.streamID, "error", err)
	}

	slog.Info("Stream finalized",
		"streamId", st.streamID,
		"segments", segmentCount,
		"duration", totalDuration,
	)
}

// ===============================
// VOD MANIFEST
// ===============================

func (st *SegmentTracker) buildAndUploadVODManifest() {
	if st.cdnBaseURL == "" {
		slog.Warn("cdnBaseURL not configured, skipping VOD manifest generation", "streamId", st.streamID)
		return
	}

	vodPath, err := BuildAndSaveVODManifest(st.streamDir, st.streamID, st.cdnBaseURL)
	if err != nil {
		slog.Error("Failed to build VOD manifest", "streamId", st.streamID, "error", err)
		return
	}

	remotePath := fmt.Sprintf("streams/%s/vod.mpd", st.streamID)
	if err := st.storage.UploadFile(context.Background(), vodPath, remotePath, "application/dash+xml"); err != nil {
		slog.Error("Failed to upload VOD manifest to MinIO", "streamId", st.streamID, "error", err)
		return
	}

	vodURL := fmt.Sprintf("%s/%s/vod.mpd", st.cdnBaseURL, st.streamID)

	if err := st.queries.SetVodManifestUrl(context.Background(), stream.SetVodManifestUrlParams{
		StreamId:       st.streamID,
		VodManifestUrl: pgtype.Text{Valid: true, String: vodURL},
	}); err != nil {
		slog.Error("Failed to save VOD manifest URL to DB", "streamId", st.streamID, "error", err)
		return
	}

	slog.Info("VOD manifest built and uploaded",
		"streamId", st.streamID,
		"remotePath", remotePath,
		"vodURL", vodURL,
	)
}

// ===============================
// HELPERS
// ===============================

func (st *SegmentTracker) parseChunkName(filename string) (rid int, seq int) {
	_, _ = fmt.Sscanf(filename, "chunk-%d-%d.m4s", &rid, &seq)
	return
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
