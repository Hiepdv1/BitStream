package manager

import (
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

	process map[string]*ffmpeg.StreamProcess
	mu      sync.Mutex
	wg      sync.WaitGroup

	actionChan chan model.StreamPayload
	quit       chan struct{}

	gc *GarbageCollector
}

func NewStreamManager(cfg *config.AppConfig, queries *stream.Queries, storage *minio.Service) *StreamManager {
	return &StreamManager{
		config:     cfg,
		queries:    queries,
		storage:    storage,
		process:    make(map[string]*ffmpeg.StreamProcess),
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
		slog.Error("Stream manager queue is full", "streamId", payload.StreamID)
	}
}

func (m *StreamManager) worker(id int) {
	defer m.wg.Done()
	for {
		select {
		case <-m.quit:
			return
		case job, ok := <-m.actionChan:
			if !ok {
				return
			}
			m.handlePayload(job)
		}
	}
}
