package consumer

import (
	"context"

	"github.com/IBM/sarama"
)

type MessageHandler func(ctx context.Context, msg *sarama.ConsumerMessage) error

type KafkaConsumer struct {
	handler MessageHandler
}
