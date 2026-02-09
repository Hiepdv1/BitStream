package deps

import (
	"database/sql"

	"github.com/bitstream/backend-go/internal/config"
	"github.com/bitstream/backend-go/internal/storage/minio"
)

type Deps struct {
	DB      *sql.DB
	Config  *config.AppConfig
	Storage *minio.Service
}
