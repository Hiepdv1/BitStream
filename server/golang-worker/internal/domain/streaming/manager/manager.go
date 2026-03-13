package manager

import (
	"context"
	"log/slog"
	"sync"

	"github.com/bitstream/backend-go/internal/config"
	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/domain/streaming/ffmpeg"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
	"github.com/bitstream/backend-go/internal/storage/minio"
)

type StreamManager struct {
	config  *config.AppConfig
	queries *stream.Queries
	storage *minio.Service

	ctx    context.Context
	cancel context.CancelFunc

	process   map[string]*ffmpeg.StreamProcess
	probing   map[string]bool
	probeCtxs map[string]context.CancelFunc
	mu        sync.Mutex
	wg        sync.WaitGroup

	actionChan chan model.StreamPayload
	quit       chan struct{}

	gc *GarbageCollector
}

func NewStreamManager(cfg *config.AppConfig, queries *stream.Queries, storage *minio.Service) *StreamManager {
	ctx, cancel := context.WithCancel(context.Background())
	return &StreamManager{
		config:     cfg,
		queries:    queries,
		storage:    storage,
		ctx:        ctx,
		cancel:     cancel,
		process:    make(map[string]*ffmpeg.StreamProcess),
		probing:    make(map[string]bool),
		probeCtxs:  make(map[string]context.CancelFunc),
		actionChan: make(chan model.StreamPayload, 100),
		quit:       make(chan struct{}),
		gc:         NewGarbageCollector(queries, cfg.FFmpeg.OutputDir),
	}
}

func (m *StreamManager) Start(workers int) {
	slog.Info("Starting stream manager", "worker_count", workers)

	go m.gc.Run()

	for i := range workers {
		m.wg.Add(1)
		go m.worker(i)
	}
}

func (m *StreamManager) Shutdown() {
	m.cancel()
	close(m.quit)

	m.gc.Stop()

	m.wg.Wait()
	close(m.actionChan)
	m.mu.Lock()

	defer m.mu.Unlock()
	for _, proc := range m.process {
		_ = proc.Stop()
	}
}

func (m *StreamManager) Dispatch(payload model.StreamPayload) {
	slog.Info("Dispatching job", "streamId", payload.StreamID, "action", payload.Action)
	select {
	case m.actionChan <- payload:
	default:
		slog.Warn("Stream manager queue is full, dropping event",
			"streamId", payload.StreamID,
			"action", payload.Action,
			"queueLen", len(m.actionChan),
		)
	}
}

func (m *StreamManager) worker(id int) {
	defer m.wg.Done()
	slog.Debug("Stream worker started", "workerId", id)
	for {
		select {
		case <-m.ctx.Done():
			slog.Info("Stream worker stopped", "workerId", id)
			return
		case job, ok := <-m.actionChan:
			if !ok {
				return
			}
			m.handlePayload(job)
		}
	}
}

func (m *StreamManager) isProbing(streamID string) bool {
	return m.probing[streamID]
}

func (m *StreamManager) setProbing(streamID string, probing bool, cancel context.CancelFunc) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if probing {
		m.probing[streamID] = true
		if cancel != nil {
			m.probeCtxs[streamID] = cancel
		}
	} else {
		delete(m.probing, streamID)
		if c, ok := m.probeCtxs[streamID]; ok {
			c()
			delete(m.probeCtxs, streamID)
		}
	}
}

func (m *StreamManager) cancelProbe(streamID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if c, ok := m.probeCtxs[streamID]; ok {
		c()
	}
}
