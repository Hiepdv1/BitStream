package models

import "time"

type MessagePayload struct {
	Action     string `json:"action"`
	ID         string `json:"id"`
	Opcode     int    `json:"opcode"`
	StreamID   string `json:"streamId"`
	Message    string `json:"message,omitempty"`
	UserID     string `json:"userId,omitempty"`
	IsPinned   bool   `json:"isPinned,omitempty"`
	IsDeleted  bool   `json:"isDeleted,omitempty"`
	Type       string `json:"type,omitempty"`
	OffsetMs   int64  `json:"offsetMs,omitempty"`
	RetryCount int    `json:"retryCount"`
	MaxRetry   int    `json:"maxRetry"`
	EventID    string `json:"eventId"`
	OccurredAt string `json:"occurredAt"`

	Error      string    `json:"error,omitempty"`
	ReceivedAt time.Time `json:"-"`
}
