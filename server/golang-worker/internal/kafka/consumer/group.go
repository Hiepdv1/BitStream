package consumer

import (
	"context"

	"github.com/IBM/sarama"
)

type Group struct {
	client  sarama.ConsumerGroup
	handler sarama.ConsumerGroupHandler
}

func NewGroup(brokers []string, groupId string, handler sarama.ConsumerGroupHandler) (*Group, error) {
	cfg := sarama.NewConfig()
	cfg.Version = sarama.V3_5_0_0
	cfg.Consumer.Offsets.Initial = sarama.OffsetOldest

	client, err := sarama.NewConsumerGroup(brokers, groupId, cfg)
	if err != nil {
		return nil, err
	}

	return &Group{
		client:  client,
		handler: handler,
	}, nil
}

func (g *Group) Consume(ctx context.Context, topics []string) error {
	for {
		err := g.client.Consume(ctx, topics, g.handler)
		if err != nil {
			return err
		}
	}
}
