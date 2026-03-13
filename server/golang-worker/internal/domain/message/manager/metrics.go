package manager

import (
	"log/slog"
	"sync"
	"sync/atomic"
	"time"
)

const metricsLogInterval = 30 * time.Second

type Metrics struct {
	totalReceived atomic.Int64
	totalFlushed  atomic.Int64
	totalBatches  atomic.Int64
	activeBuffers atomic.Int64
}

func NewMetrics() *Metrics {
	return &Metrics{}
}

func (m *Metrics) IncrReceived() {
	m.totalReceived.Add(1)
}

func (m *Metrics) AddFlushed(n int64) {
	m.totalFlushed.Add(n)
}

func (m *Metrics) IncrBatches() {
	m.totalBatches.Add(1)
}

func (m *Metrics) SetActiveBuffers(n int64) {
	m.activeBuffers.Store(n)
}

func (m *Metrics) GetReceived() int64 {
	return m.totalReceived.Load()
}

func (m *Metrics) GetFlushed() int64 {
	return m.totalFlushed.Load()
}

func (m *Metrics) GetBatches() int64 {
	return m.totalBatches.Load()
}

func (m *Metrics) GetActiveBuffers() int64 {
	return m.activeBuffers.Load()
}

func (m *Metrics) StartLogging(quit <-chan struct{}, wg *sync.WaitGroup) {
	defer wg.Done()

	ticker := time.NewTicker(metricsLogInterval)
	defer ticker.Stop()

	for {
		select {
		case <-quit:
			return
		case <-ticker.C:
			received := m.totalReceived.Load()
			if received == 0 {
				continue
			}

			slog.Info("Message manager metrics",
				"received", received,
				"flushed", m.totalFlushed.Load(),
				"batches", m.totalBatches.Load(),
				"activeBuffers", m.activeBuffers.Load(),
			)
		}
	}
}
