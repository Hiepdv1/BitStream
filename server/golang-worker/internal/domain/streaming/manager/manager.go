package manager

import (
	"log/slog"
	"sync"

	"github.com/bitstream/backend-go/internal/domain/streaming/ffmpeg"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
)

type StreamManager struct {
	mu      sync.Mutex
	process map[string]*ffmpeg.StreamProcess
	jobs    chan model.StreamPayload
	wg      sync.WaitGroup
	quit    chan struct{}
}

func NewStreamManager() *StreamManager {
	return &StreamManager{
		process: make(map[string]*ffmpeg.StreamProcess),
		jobs:    make(chan model.StreamPayload, 1000),
		quit:    make(chan struct{}),
	}
}

func (m *StreamManager) Start(workers int) {
	for range workers {
		m.wg.Add(1)
		go m.worker()
	}
}

func (m *StreamManager) Shutdown() {
	close(m.quit)

	m.wg.Wait()
	close(m.jobs)
	m.mu.Lock()

	defer m.mu.Unlock()
	for _, proc := range m.process {
		_ = proc.Kill()
	}
}

func (m *StreamManager) Dispatch(payload model.StreamPayload) {
	select {
	case m.jobs <- payload:
	default:
		slog.Error("Stream manager queue is full", "streamId", payload.StreamID)
	}
}

func (m *StreamManager) worker() {
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
