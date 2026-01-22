package streaming

import (
	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/domain/streaming/manager"
	"github.com/bitstream/backend-go/internal/kafka/consumer"
	"github.com/bitstream/backend-go/internal/kafka/topics"
)

var streamManager *manager.StreamManager

func Register(env *config.AppConfig) {
	streamManager = manager.NewStreamManager(env)
	streamManager.Start(5)

	consumer.Register(consumer.Registration{
		Topics:        []string{topics.STREAM_ON_PUBLISH},
		ConsumerCount: 10,
		Handler:       StreamHandler,
	})
}

func Shutdown() {
	if streamManager != nil {
		streamManager.Shutdown()
	}
}
