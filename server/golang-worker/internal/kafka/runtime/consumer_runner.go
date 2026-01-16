package runtime

import (
	"context"
	"log/slog"
	"time"

	"github.com/IBM/sarama"
	"github.com/bitstream/backend-go/internal/kafka/consumer"
)

type ConsumerRunner struct {
	brokers   []string
	groupID   string
	saramaCfg *sarama.Config
}

func NewConsumerRunner(
	brokers []string,
	groupID string,
	saramaCfg *sarama.Config,
) *ConsumerRunner {
	return &ConsumerRunner{
		brokers:   brokers,
		groupID:   groupID,
		saramaCfg: saramaCfg,
	}
}

func (r *ConsumerRunner) Run(
	ctx context.Context,
	reg consumer.Registration,
	index int,
) {
	backoff := time.Second

	for ctx.Err() == nil {
		if err := r.runOnce(ctx, reg, index); err != nil {
			slog.Error("consumer crashed",
				"index", index,
				"topics", reg.Topics,
				"err", err,
			)

			time.Sleep(backoff)
			if backoff < 30*time.Second {
				backoff *= 2
			}
		}
	}
}

func (r *ConsumerRunner) runOnce(
	ctx context.Context,
	reg consumer.Registration,
	index int,
) error {
	group, err := sarama.NewConsumerGroup(
		r.brokers,
		r.groupID,
		r.saramaCfg,
	)
	if err != nil {
		return err
	}
	defer group.Close()

	handler := consumer.NewConsumer(reg.Handler)

	slog.Info("consumer started",
		"group", r.groupID,
		"index", index,
		"topics", reg.Topics,
	)

	for ctx.Err() == nil {
		if err := group.Consume(ctx, reg.Topics, handler); err != nil {
			return err
		}
	}

	slog.Info("consumer stopped",
		"group", r.groupID,
		"index", index,
	)
	return nil
}
