package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/db"
	"github.com/bitstream/backend-go/internal/deps"
	"github.com/bitstream/backend-go/internal/domain"
	"github.com/bitstream/backend-go/internal/kafka"
	"github.com/bitstream/backend-go/internal/kafka/service"
	"github.com/bitstream/backend-go/internal/logger"
	"github.com/bitstream/backend-go/internal/storage/minio"
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

	database, err := db.NewPostgres(env.Db.Url)
	if err != nil {
		slog.Error("failed to init database", "err", err)
		os.Exit(1)
	}
	defer database.Close()

	storageService, err := minio.NewService(env.MinIO)
	if err != nil {
		slog.Error("failed to init minio", "err", err)
		os.Exit(1)
	}

	appDeps := &deps.Deps{
		DB:      database,
		Config:  env,
		Storage: storageService,
	}

	if err := storageService.EnsureBucket(context.Background()); err != nil {
		slog.Error("failed to ensure bucket", "err", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	saramaCfg := kafka.NewSaramaConfig(env.Kafka)

	domain.RegisterAll(appDeps)

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
