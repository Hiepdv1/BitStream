package deps

import (
	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/kafka/producer"
	"github.com/bitstream/backend-go/internal/storage/minio"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Deps struct {
	DB            *pgxpool.Pool
	Config        *config.AppConfig
	Storage       *minio.Service
	KafkaProducer *producer.Producer
}
