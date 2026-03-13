package db

import (
	"context"
	"errors"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgres(dbURL string) (*pgxpool.Pool, error) {
	if dbURL == "" {
		return nil, errors.New("DATABASE_URL is empty")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, err
	}

	config.MaxConns = 25
	config.MinConns = 5

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, err
	}

	slog.Info("connected to postgres (pgxpool)")

	return pool, nil
}
