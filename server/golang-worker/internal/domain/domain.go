package domain

import (
	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/domain/streaming"
)

func RegisterAll(env *config.AppConfig) {
	streaming.Register(env)
}

func Shutdown() {
	streaming.Shutdown()
}
