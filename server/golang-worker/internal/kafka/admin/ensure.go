package admin

import "github.com/bitstream/backend-go/internal/kafka/topics"

func (a *Admin) EnsureTopic() error {
	existing, err := a.client.ListTopics()
	if err != nil {
		return err
	}

	for name, detail := range topics.TopicDefinitions {
		if _, ok := existing[name]; !ok {
			err := a.client.CreateTopic(name, detail, false)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
