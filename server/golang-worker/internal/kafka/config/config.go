package config

import (
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type KafkaConfig struct {
	Brokers  []string
	ClientID string
	Version  string

	Consumer ConsumerConfig
	Producer ProducerConfig
}

type ConsumerConfig struct {
	GroupID          string
	InitialOffset    string
	MinBytes         int
	MaxBytes         int
	MaxWaitTime      time.Duration
	SessionTimeout   time.Duration
	RebalanceTimeout time.Duration
}

type ProducerConfig struct {
	BatchSize    int
	BatchTimeout time.Duration
	RequiredAcks int
	RetryMax     int
}

func LoadKafkaConfig() KafkaConfig {
	_ = godotenv.Load()
	v := viper.New()

	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	v.SetConfigName("kafka")
	v.SetConfigType("yaml")
	v.AddConfigPath("./configs")
	v.AddConfigPath(".")

	v.SetDefault("kafka.clientId", "go-stream-worker")
	v.SetDefault("kafka.version", "3.5.0")
	v.SetDefault("kafka.consumer.sessionTimeout", 10000)

	if err := v.ReadInConfig(); err != nil {
		panic(err)
	}

	return KafkaConfig{
		Brokers:  getBrokers(v, "kafka.brokers"),
		ClientID: v.GetString("kafka.clientId"),
		Version:  v.GetString("kafka.version"),

		Consumer: ConsumerConfig{
			GroupID:          v.GetString("kafka.consumer.groupId"),
			InitialOffset:    v.GetString("kafka.consumer.initialOffset"),
			MinBytes:         v.GetInt("kafka.consumer.minBytes"),
			MaxBytes:         v.GetInt("kafka.consumer.maxBytes"),
			MaxWaitTime:      time.Duration(v.GetInt("kafka.consumer.maxWaitTime")) * time.Millisecond,
			SessionTimeout:   time.Duration(v.GetInt("kafka.consumer.sessionTimeout")) * time.Millisecond,
			RebalanceTimeout: time.Duration(v.GetInt("kafka.consumer.rebalanceTimeout")) * time.Millisecond,
		},

		Producer: ProducerConfig{
			BatchSize:    v.GetInt("kafka.producer.batchSize"),
			BatchTimeout: time.Duration(v.GetInt("kafka.producer.batchTimeoutMs")) * time.Millisecond,
			RequiredAcks: v.GetInt("kafka.producer.requiredAcks"),
			RetryMax:     v.GetInt("kafka.producer.retryMax"),
		},
	}
}

func getBrokers(v *viper.Viper, key string) []string {
	val := v.Get(key)
	switch t := val.(type) {
	case []any:
		res := make([]string, len(t))
		for i, v := range t {
			res[i] = v.(string)
		}
		return res
	case string:
		return strings.Split(t, ",")
	default:
		return []string{
			"localhost:9092",
			"kafka:29092",
		}
	}
}
