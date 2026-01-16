package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/bitstream/backend-go/internal/domain"
	"github.com/bitstream/backend-go/internal/kafka"
	kafkaConfig "github.com/bitstream/backend-go/internal/kafka/config"
	"github.com/bitstream/backend-go/internal/kafka/service"
	"github.com/bitstream/backend-go/internal/logger"
)

func main() {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	log := logger.New(logger.Options{
		Env:      env,
		Level:    slog.LevelDebug,
		FilePath: "../../logs/app.log",
		AppName:  "bitstream-worker",
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg := kafkaConfig.LoadKafkaConfig()

	saramaCfg := kafka.NewSaramaConfig(cfg)

	domain.RegisterAll()

	kafkaService := service.NewKafkaService(cfg, saramaCfg)
	if err := kafkaService.Start(ctx); err != nil {
		log.Error("Kafka service failed", "error", err)
		panic(err)
	}

	log.Info("Worker started ...")

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	log.Info("Shutting down worker...")
	domain.Shutdown()
	log.Info("Worker stopped.")
}
