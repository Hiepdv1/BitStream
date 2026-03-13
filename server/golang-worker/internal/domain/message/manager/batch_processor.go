package manager

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/bitstream/backend-go/internal/domain/message/models"
	"github.com/bitstream/backend-go/internal/domain/message/types"
	"github.com/bitstream/backend-go/internal/kafka/payload"
	"github.com/bitstream/backend-go/internal/kafka/topics"
	"github.com/jackc/pgx/v5"
)

const (
	maxBatchSize  = 100
	flushInterval = 2 * time.Second
	idleTimeout   = 5 * time.Minute
)

type BatchBuffer struct {
	streamID string
	messages []models.MessagePayload
	mu       sync.Mutex
	fileLock sync.Mutex

	timer   *time.Timer
	lastAdd time.Time
	closed  bool

	manager *MessageManager
}

func NewBatchBuffer(streamID string, mgr *MessageManager) *BatchBuffer {
	return &BatchBuffer{
		streamID: streamID,
		messages: make([]models.MessagePayload, 0, maxBatchSize),
		lastAdd:  time.Now(),
		manager:  mgr,
	}
}

func (b *BatchBuffer) Add(msg models.MessagePayload) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.closed {
		slog.Warn("Attempted to add message to closed buffer", "streamId", b.streamID)
		return
	}

	b.messages = append(b.messages, msg)
	b.lastAdd = time.Now()

	if len(b.messages) >= maxBatchSize {
		b.flushLocked()
		return
	}

	b.resetTimerLocked()
}

func (b *BatchBuffer) IsIdle() bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	return len(b.messages) == 0 && time.Since(b.lastAdd) > idleTimeout
}

func (b *BatchBuffer) Close() {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.closed {
		return
	}

	b.closed = true

	if b.timer != nil {
		b.timer.Stop()
		b.timer = nil
	}

	if len(b.messages) > 0 {
		b.flushLocked()
	}
}

func (b *BatchBuffer) resetTimerLocked() {
	if b.timer != nil {
		b.timer.Stop()
	}

	b.timer = time.AfterFunc(flushInterval, func() {
		b.mu.Lock()
		defer b.mu.Unlock()

		if !b.closed && len(b.messages) > 0 {
			b.flushLocked()
		}
	})
}

func (b *BatchBuffer) flushLocked() {
	if len(b.messages) == 0 {
		return
	}

	batch := b.messages
	b.messages = make([]models.MessagePayload, 0, maxBatchSize)

	if b.timer != nil {
		b.timer.Stop()
		b.timer = nil
	}

	b.manager.metrics.AddFlushed(int64(len(batch)))
	b.manager.metrics.IncrBatches()

	slog.Info("Flushing message batch",
		"streamId", b.streamID,
		"batchSize", len(batch),
	)

	b.processBatch(batch)
}

func (b *BatchBuffer) processBatch(batch []models.MessagePayload) {
	maxRetries := 3
	var err error

	var failedMessages []models.MessagePayload

	batchAttempt := batch

	for i := range maxRetries {
		failedMessages, err = b.executeCombinedBatch(batchAttempt)

		if len(failedMessages) == 0 {
			b.manager.metrics.AddFlushed(int64(len(batch)))
			return
		}

		batchAttempt = failedMessages

		slog.Warn("Retry combined batch", "attempt", i+1, "error", err, "streamId", b.streamID)
		time.Sleep(time.Duration(100*(i+1)) * time.Millisecond)
	}

	b.manager.metrics.AddFlushed(int64(len(batch)) - int64(len(failedMessages)))

	if len(failedMessages) > 0 {
		if err := b.publishToDLQ(failedMessages, err); err != nil {
			b.writeToRecoveryFile(failedMessages)
		}
	}
}

func (b *BatchBuffer) executeCombinedBatch(batch []models.MessagePayload) ([]models.MessagePayload, error) {
	pgBatch := &pgx.Batch{}

	var queuedMessages []models.MessagePayload

	for _, msg := range batch {
		switch msg.Action {
		case "INSERT":
			b.queueInsert(pgBatch, msg)
			queuedMessages = append(queuedMessages, msg)
		case "UPDATE":
			b.queueUpdate(pgBatch, msg)
			queuedMessages = append(queuedMessages, msg)
		case "DELETE":
			b.queueDelete(pgBatch, msg)
			queuedMessages = append(queuedMessages, msg)
		default:
			slog.Warn("Unknown action ignored", "action", msg.Action, "id", msg.ID)
		}
	}

	if len(queuedMessages) == 0 {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	batchResult := b.manager.DB.SendBatch(ctx, pgBatch)
	defer batchResult.Close()

	var failedMessages []models.MessagePayload
	var lastErr error

	for i := range len(queuedMessages) {
		_, err := batchResult.Exec()
		if err != nil {
			lastErr = err
			msg := queuedMessages[i]

			slog.Error("Individual message failed in batch",
				"id", msg.ID,
				"action", msg.Action,
				"error", err)

			msg.Error = fmt.Sprintf("ERROR: %s | ORIGINAL: %s", err.Error(), msg.Message)
			failedMessages = append(failedMessages, msg)
		}
	}

	return failedMessages, lastErr
}

func (b *BatchBuffer) queueInsert(pgBatch *pgx.Batch, msg models.MessagePayload) {
	query := `
		INSERT INTO "ChatMessage" (
			id, opcode, "streamId", "userId", content, type, "metaData", "offsetMs", "isDeleted", "isPinned"
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO NOTHING`

	metaData := []byte("{}")

	pgBatch.Queue(query,
		msg.ID,
		int32(msg.Opcode),
		msg.StreamID,
		b.toText(msg.UserID),
		msg.Message,
		msg.Type,
		metaData,
		int32(msg.OffsetMs),
		false,
		false,
	)
}

func (b *BatchBuffer) queueUpdate(pgBatch *pgx.Batch, msg models.MessagePayload) {
	query := `UPDATE "ChatMessage" SET "isPinned" = $1, "updatedAt" = now() WHERE id = $2`
	pgBatch.Queue(query, true, msg.ID)
}

func (b *BatchBuffer) queueDelete(pgBatch *pgx.Batch, msg models.MessagePayload) {
	query := `UPDATE "ChatMessage" SET "isDeleted" = TRUE, "deletedAt" = now() WHERE id = $1`
	pgBatch.Queue(query, msg.ID)
}

func (b *BatchBuffer) toText(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func (b *BatchBuffer) publishToDLQ(batch []models.MessagePayload, reason error) error {
	value, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	data := payload.ChatMessageDLQ{
		StreamID: b.streamID,
		Reason:   reason.Error(),
		Data:     value,
	}

	dataBytes, err := json.Marshal(data)
	if err != nil {
		return err
	}

	return b.manager.kafka.Publish(
		topics.CHAT_MESSAGE_DLQ,
		"",
		dataBytes,
	)
}

func (b *BatchBuffer) writeToRecoveryFile(batch []models.MessagePayload) {
	b.fileLock.Lock()
	defer b.fileLock.Unlock()

	dir := b.manager.config.Storage.RecoveryDir
	if err := os.MkdirAll(dir, 0755); err != nil {
		slog.Error("Could not create recovery directory", "error", err)
		return
	}

	fileName := filepath.Join(dir, fmt.Sprintf("stream_%s.jsonl", b.streamID))

	f, err := os.OpenFile(fileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		slog.Error("failed to open recovery file", "error", err)
		return
	}
	defer f.Close()

	entry := types.RecoveryEntry{
		Timestamp: time.Now().Unix(),
		StreamID:  b.streamID,
		Data:      batch,
	}

	jsonData, err := json.Marshal(entry)
	if err != nil {
		slog.Error("Failed to marshal recovery entry", "error", err)
		return
	}

	if _, err := f.Write(append(jsonData, '\n')); err != nil {
		slog.Error("Failed to write to recovery file", "error", err)
		return
	}

	if err := f.Sync(); err != nil {
		slog.Error("Failed to sync recovery file", "error", err)
		return
	}

	slog.Info("Successfully backed up batch to local file", "file", fileName)

}
