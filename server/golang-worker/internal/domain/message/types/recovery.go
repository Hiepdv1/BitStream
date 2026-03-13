package types

import "github.com/bitstream/backend-go/internal/domain/message/models"

type RecoveryEntry struct {
	Timestamp int64                   `json:"timestamp"`
	StreamID  string                  `json:"stream_id"`
	Data      []models.MessagePayload `json:"data"`
}
