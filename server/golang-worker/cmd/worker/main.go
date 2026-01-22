package main

import (
	"context"
	"flag"
	"os"
	"os/signal"
	"syscall"

	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/domain"
	"github.com/bitstream/backend-go/internal/kafka"
	"github.com/bitstream/backend-go/internal/kafka/service"
	"github.com/bitstream/backend-go/internal/logger"
)

func resolveConfigPath() string {
	if path := flag.String("config", "", "config file path"); *path != "" {
		return *path
	}

	if path := os.Getenv("APP_CONFIG"); path != "" {
		return path
	}

	return "configs/app.yaml"
}

func main() {
	cfgPath := resolveConfigPath()

	env, err := config.Load(cfgPath)
	if err != nil {
		panic(err)
	}

	log := logger.New(logger.Options{
		Env:      env.Env,
		Level:    env.Log.Level,
		FilePath: env.Log.File,
		AppName:  "bitstream-worker",
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	saramaCfg := kafka.NewSaramaConfig(env.Kafka)

	domain.RegisterAll(env)

	kafkaService := service.NewKafkaService(env.Kafka, saramaCfg)
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
