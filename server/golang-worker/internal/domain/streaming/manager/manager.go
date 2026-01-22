package manager

import (
	"log/slog"
	"sync"

	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/domain/streaming/ffmpeg"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
)

type StreamManager struct {
	mu      sync.Mutex
	process map[string]*ffmpeg.StreamProcess
	jobs    chan model.StreamPayload
	wg      sync.WaitGroup
	quit    chan struct{}
	env     *config.AppConfig
}

func NewStreamManager(env *config.AppConfig) *StreamManager {
	return &StreamManager{
		process: make(map[string]*ffmpeg.StreamProcess),
		jobs:    make(chan model.StreamPayload, 1000),
		quit:    make(chan struct{}),
		env:     env,
	}
}

func (m *StreamManager) Start(workers int) {
	slog.Info("Starting stream manager", "worker_count", workers)
	for i := range workers {
		m.wg.Add(1)
		go m.worker(i)
	}
}

func (m *StreamManager) Shutdown() {
	close(m.quit)

	m.wg.Wait()
	close(m.jobs)
	m.mu.Lock()

	defer m.mu.Unlock()
	for _, proc := range m.process {
		_ = proc.Stop()
	}
}

func (m *StreamManager) Dispatch(payload model.StreamPayload) {
	slog.Info("Dispatching job", "streamId", payload.StreamID, "action", payload.Action)
	select {
	case m.jobs <- payload:
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
		case job, ok := <-m.jobs:
			if !ok {
				return
			}
			m.handlePayload(job)
		}
	}
}
