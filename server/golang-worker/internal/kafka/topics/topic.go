package topics

import "github.com/IBM/sarama"

const (
	STREAM_ON_PUBLISH     = "stream.on_publish"
	STREAM_ON_PUBLISH_DLQ = "stream.on_publish.dlq"
)

var TopicDefinitions = map[string]*sarama.TopicDetail{
	STREAM_ON_PUBLISH: {
		NumPartitions:     10,
		ReplicationFactor: 1,
	},
	STREAM_ON_PUBLISH_DLQ: {
		NumPartitions:     3,
		ReplicationFactor: 1,
	},
}
