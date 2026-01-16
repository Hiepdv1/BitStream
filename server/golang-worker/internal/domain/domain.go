package domain

import "github.com/bitstream/backend-go/internal/domain/streaming"

func RegisterAll() {
	streaming.Register()
}

func Shutdown() {
	streaming.Shutdown()
}
