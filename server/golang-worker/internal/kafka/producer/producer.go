package producer

import "github.com/IBM/sarama"

type Producer struct {
	producer sarama.SyncProducer
}

func NewProducer(brokers []string) (*Producer, error) {
	cfg := sarama.NewConfig()
	cfg.Producer.Return.Successes = true
	cfg.Producer.RequiredAcks = sarama.WaitForAll

	producer, err := sarama.NewSyncProducer(brokers, cfg)
	if err != nil {
		return nil, err
	}

	return &Producer{
		producer: producer,
	}, nil
}

func (p *Producer) Publish(topic, key string, value []byte, partition ...int32) error {
	if len(partition) > 0 {
		_, _, err := p.producer.SendMessage(&sarama.ProducerMessage{
			Topic:     topic,
			Key:       sarama.StringEncoder(key),
			Value:     sarama.ByteEncoder(value),
			Partition: partition[0],
		})

		return err
	}

	_, _, err := p.producer.SendMessage(&sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(key),
		Value: sarama.ByteEncoder(value),
	})

	return err
}

func (p *Producer) Close() error {
	return p.producer.Close()
}
