package admin

import "github.com/IBM/sarama"

type Admin struct {
	client sarama.ClusterAdmin
}

func NewAdmin(brokers []string) (*Admin, error) {
	cfg := sarama.NewConfig()

	client, err := sarama.NewClusterAdmin(brokers, cfg)
	if err != nil {
		return nil, err
	}

	return &Admin{
		client: client,
	}, nil
}

func (a *Admin) Close() error {
	return a.client.Close()
}
