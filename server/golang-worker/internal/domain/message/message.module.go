package message

import (
	"github.com/bitstream/backend-go/internal/deps"
	"github.com/bitstream/backend-go/internal/domain/message/manager"
	"github.com/bitstream/backend-go/internal/kafka/consumer"
	"github.com/bitstream/backend-go/internal/kafka/topics"
)

var messageManager *manager.MessageManager

func Register(d *deps.Deps) {
	messageManager = manager.NewMessageManager(d.Config, d.DB, d.KafkaProducer)
	messageManager.Start()

	consumer.Register(consumer.Registration{
		Topics:        []string{topics.CHAT_MESSAGE},
		ConsumerCount: 12,
		Handler:       MessageHandler,
	})
}

func Shutdown() {
	if messageManager != nil {
		messageManager.Shutdown()
	}
}
