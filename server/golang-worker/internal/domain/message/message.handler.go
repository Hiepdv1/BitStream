package message

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/IBM/sarama"
	"github.com/bitstream/backend-go/internal/domain/message/models"
)

func MessageHandler(ctx context.Context, msg *sarama.ConsumerMessage) error {
	var payload models.MessagePayload

	if err := json.Unmarshal(msg.Value, &payload); err != nil {
		slog.Error("Failed to unmarshal message payload",
			"error", err,
			"partition", msg.Partition,
			"offset", msg.Offset,
		)
		return err
	}

	payload.ReceivedAt = time.Now()

	messageManager.Dispatch(payload)

	slog.Debug("Message dispatched",
		"streamId", payload.StreamID,
		"userId", payload.UserID,
		"eventId", payload.EventID,
	)

	return nil
}
