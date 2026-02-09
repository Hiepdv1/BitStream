package domain

import (
	"github.com/bitstream/backend-go/internal/deps"
	"github.com/bitstream/backend-go/internal/domain/streaming"
)

func RegisterAll(d *deps.Deps) {
	streaming.Register(d)
}

func Shutdown() {
	streaming.Shutdown()
}
