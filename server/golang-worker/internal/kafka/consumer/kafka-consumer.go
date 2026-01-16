package consumer

import (
	"context"
	"log/slog"

	"github.com/IBM/sarama"
)

func NewConsumer(handler MessageHandler) *KafkaConsumer {
	return &KafkaConsumer{
		handler: handler,
	}
}

func (c *KafkaConsumer) Setup(session sarama.ConsumerGroupSession) error {
	return nil
}

func (c *KafkaConsumer) Cleanup(session sarama.ConsumerGroupSession) error {
	return nil
}

func (c *KafkaConsumer) ConsumeClaim(
	session sarama.ConsumerGroupSession,
	claim sarama.ConsumerGroupClaim,
) error {

	for msg := range claim.Messages() {
		if err := c.handler(context.Background(), msg); err != nil {
			slog.Error("handle message failed", "error", err.Error())
			return err
		}

		session.MarkMessage(msg, "")
		slog.Info("Message marked", "topic", msg.Topic, "partition", msg.Partition, "offset", msg.Offset)
		session.Commit()
	}

	return nil
}
