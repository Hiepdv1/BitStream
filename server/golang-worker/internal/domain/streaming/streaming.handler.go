package streaming

import (
	"context"
	"encoding/json"
	"log/slog"

	"github.com/IBM/sarama"
	"github.com/bitstream/backend-go/internal/domain/streaming/model"
)

func StreamHandler(ctx context.Context, msg *sarama.ConsumerMessage) error {
	var payload model.StreamPayload

	if err := json.Unmarshal(msg.Value, &payload); err != nil {
		return err
	}

	streamManager.Dispatch(payload)

	slog.Info(
		"Stream "+string(payload.Action),
		"streamId", payload.StreamID,
		"eventId", payload.EventID,
	)

	return nil
}
