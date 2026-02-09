package config

import (
	"log/slog"
	"time"
)

type AppConfig struct {
	Env    string       `mapstructure:"env"`
	Server ServerConfig `mapstructure:"server"`
	Log    LogConfig    `mapstructure:"log"`
	Kafka  KafkaConfig  `mapstructure:"kafka"`
	FFmpeg FFmpegConfig `mapstructure:"ffmpeg"`
	Db     DbConfig     `mapstructure:"db"`
	MinIO  MinIOConfig  `mapstructure:"minio"`
}

type MinIOConfig struct {
	Endpoint        string `mapstructure:"endpoint"`
	AccessKeyID     string `mapstructure:"accessKeyId"`
	SecretAccessKey string `mapstructure:"secretAccessKey"`
	BucketName      string `mapstructure:"bucketName"`
	UseSSL          bool   `mapstructure:"useSSL"`
}

type DbConfig struct {
	Url string `mapstructure:"url"`
}

type FFmpegConfig struct {
	OutputDir string `mapstructure:"outputDir"`
}

type ServerConfig struct {
	Port int `mapstructure:"port"`
}

type LogConfig struct {
	Level slog.Level `mapstructure:"level"`
	File  string     `mapstructure:"file"`
}

type KafkaConfig struct {
	Brokers  []string `mapstructure:"brokers"`
	ClientID string   `mapstructure:"clientId"`
	Version  string   `mapstructure:"version"`

	Consumer ConsumerConfig `mapstructure:"consumer"`
	Producer ProducerConfig `mapstructure:"producer"`
}

type ConsumerConfig struct {
	GroupID          string        `mapstructure:"groupId"`
	InitialOffset    string        `mapstructure:"initialOffset"`
	MinBytes         int           `mapstructure:"minBytes"`
	MaxBytes         int           `mapstructure:"maxBytes"`
	MaxWaitTime      time.Duration `mapstructure:"maxWaitTime"`
	SessionTimeout   time.Duration `mapstructure:"sessionTimeout"`
	RebalanceTimeout time.Duration `mapstructure:"rebalanceTimeout"`
}

type ProducerConfig struct {
	BatchSize    int           `mapstructure:"batchSize"`
	BatchTimeout time.Duration `mapstructure:"batchTimeout"`
	RequiredAcks int           `mapstructure:"requiredAcks"`
	RetryMax     int           `mapstructure:"retryMax"`
}
