package manager

import (
	"log/slog"
	"sync"
	"time"

	"github.com/bitstream/backend-go/internal/config"
	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/domain/message/models"
	"github.com/bitstream/backend-go/internal/kafka/producer"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MessageManager struct {
	config  *config.AppConfig
	queries *stream.Queries
	kafka   *producer.Producer

	buffers map[string]*BatchBuffer
	mu      sync.RWMutex
	wg      sync.WaitGroup
	quit    chan struct{}

	DB *pgxpool.Pool

	metrics *Metrics
}

func NewMessageManager(cfg *config.AppConfig, db *pgxpool.Pool, kafka *producer.Producer) *MessageManager {
	return &MessageManager{
		config:  cfg,
		queries: stream.New(db),
		kafka:   kafka,
		buffers: make(map[string]*BatchBuffer),
		quit:    make(chan struct{}),
		metrics: NewMetrics(),
		DB:      db,
	}
}

func (m *MessageManager) Start() {
	slog.Info("Starting message manager")

	m.wg.Add(2)
	go m.reaper()
	go m.metrics.StartLogging(m.quit, &m.wg)
}

func (m *MessageManager) Dispatch(payload models.MessagePayload) {
	m.metrics.IncrReceived()

	buf := m.getOrCreateBuffer(payload.StreamID)
	buf.Add(payload)
}

func (m *MessageManager) Shutdown() {
	slog.Info("Shutting down message manager")

	close(m.quit)

	m.mu.RLock()
	for _, buf := range m.buffers {
		buf.Close()
	}
	m.mu.RUnlock()

	m.wg.Wait()

	slog.Info("Message manager stopped",
		"totalReceived", m.metrics.GetReceived(),
		"totalFlushed", m.metrics.GetFlushed(),
		"totalBatches", m.metrics.GetBatches(),
	)
}

func (m *MessageManager) getOrCreateBuffer(streamID string) *BatchBuffer {
	m.mu.RLock()
	buf, exists := m.buffers[streamID]
	m.mu.RUnlock()

	if exists {
		return buf
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	buf = NewBatchBuffer(streamID, m)
	m.buffers[streamID] = buf

	m.metrics.SetActiveBuffers(int64(len(m.buffers)))

	slog.Info("Created batch buffer for stream", "streamId", streamID)
	return buf
}

func (m *MessageManager) removeBuffer(streamID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if buf, exists := m.buffers[streamID]; exists {
		buf.Close()
		delete(m.buffers, streamID)
		m.metrics.SetActiveBuffers(int64(len(m.buffers)))
		slog.Info("Removed idle batch buffer", "streamId", streamID)
	}
}

const reaperInterval = 30 * time.Second

func (m *MessageManager) reaper() {
	defer m.wg.Done()

	ticker := time.NewTicker(reaperInterval)
	defer ticker.Stop()

	slog.Info("Message buffer reaper started", "interval", reaperInterval)

	for {
		select {
		case <-m.quit:
			slog.Info("Message buffer reaper stopped")
			return
		case <-ticker.C:
			m.reapIdleBuffers()
		}
	}
}

func (m *MessageManager) reapIdleBuffers() {
	m.mu.RLock()
	var idleStreamIDs []string
	for streamID, buf := range m.buffers {
		if buf.IsIdle() {
			idleStreamIDs = append(idleStreamIDs, streamID)
		}
	}
	m.mu.RUnlock()

	for _, streamID := range idleStreamIDs {
		m.removeBuffer(streamID)
	}

	if len(idleStreamIDs) > 0 {
		slog.Info("Reaped idle buffers", "count", len(idleStreamIDs))
	}
}
