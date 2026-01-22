package service

import (
	"context"
	"log/slog"

	"github.com/IBM/sarama"
	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/kafka/admin"
	"github.com/bitstream/backend-go/internal/kafka/consumer"
	"github.com/bitstream/backend-go/internal/kafka/runtime"
)

type KafkaService struct {
	cfg       config.KafkaConfig
	saramaCfg *sarama.Config
}

func NewKafkaService(cfg config.KafkaConfig, saramaCfg *sarama.Config) *KafkaService {
	return &KafkaService{
		cfg:       cfg,
		saramaCfg: saramaCfg,
	}
}

func (k *KafkaService) Start(ctx context.Context) error {
	if err := k.bootstrap(); err != nil {
		return err
	}

	for _, reg := range consumer.All() {
		k.startRegistration(ctx, reg)
	}

	slog.Info("kafka service started")
	return nil
}

func (k *KafkaService) bootstrap() error {
	adminClient, err := admin.NewAdmin(k.cfg.Brokers)
	if err != nil {
		return err
	}
	defer adminClient.Close()

	return adminClient.EnsureTopic()
}

func (k *KafkaService) startRegistration(
	ctx context.Context,
	reg consumer.Registration,
) {
	runner := runtime.NewConsumerRunner(
		k.cfg.Brokers,
		k.cfg.Consumer.GroupID,
		k.saramaCfg,
	)

	for i := 0; i < reg.ConsumerCount; i++ {
		go runner.Run(ctx, reg, i)
	}
}
