package db

import (
	"database/sql"
	"errors"
	"log/slog"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func NewPostgres(dbURL string) (*sql.DB, error) {
	if dbURL == "" {
		return nil, errors.New("DATABASE_URL is empty")
	}

	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	slog.Info("connected to postgres")

	return db, nil
}
