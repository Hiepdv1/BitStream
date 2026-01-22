package kafka

import (
	"strings"

	"github.com/IBM/sarama"
	"github.com/bitstream/backend-go/internal/config"
)

func NewSaramaConfig(cfg config.KafkaConfig) *sarama.Config {
	c := sarama.NewConfig()

	version, err := sarama.ParseKafkaVersion(cfg.Version)
	if err != nil {
		panic(err)
	}

	c.Version = version
	c.ClientID = cfg.ClientID

	c.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange
	if strings.ToLower(cfg.Consumer.InitialOffset) == "oldest" {
		c.Consumer.Offsets.Initial = sarama.OffsetOldest
	} else {
		c.Consumer.Offsets.Initial = sarama.OffsetNewest
	}

	c.Consumer.Fetch.Min = int32(cfg.Consumer.MinBytes)
	c.Consumer.Fetch.Max = int32(cfg.Consumer.MaxBytes)
	c.Consumer.MaxWaitTime = cfg.Consumer.MaxWaitTime

	if cfg.Consumer.SessionTimeout > 0 {
		c.Consumer.Group.Session.Timeout = cfg.Consumer.SessionTimeout
		c.Consumer.Group.Heartbeat.Interval = cfg.Consumer.SessionTimeout / 3
	}

	c.Consumer.Group.Rebalance.Timeout = cfg.Consumer.RebalanceTimeout

	c.Producer.RequiredAcks = sarama.RequiredAcks(cfg.Producer.RequiredAcks)
	c.Producer.Retry.Max = cfg.Producer.RetryMax
	c.Producer.Flush.Messages = cfg.Producer.BatchSize
	c.Producer.Flush.Frequency = cfg.Producer.BatchTimeout
	c.Producer.Return.Successes = true

	return c
}
