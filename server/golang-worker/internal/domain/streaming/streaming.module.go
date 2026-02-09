package streaming

import (
	stream "github.com/bitstream/backend-go/internal/db/generated"
	"github.com/bitstream/backend-go/internal/deps"
	"github.com/bitstream/backend-go/internal/domain/streaming/manager"
	"github.com/bitstream/backend-go/internal/kafka/consumer"
	"github.com/bitstream/backend-go/internal/kafka/topics"
)

var streamManager *manager.StreamManager

func Register(d *deps.Deps) {
	queries := stream.New(d.DB)
	streamManager = manager.NewStreamManager(d.Config, queries, d.Storage)
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
