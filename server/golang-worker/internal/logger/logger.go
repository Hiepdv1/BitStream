package logger

import (
	"io"
	"log/slog"
	"os"
	"time"

	"github.com/lmittmann/tint"
)

func New(opts Options) *slog.Logger {
	var handler slog.Handler

	switch opts.Env {
	case "production":
		handler = newProdHandler(opts)
	default:
		handler = newDevHandler(opts)
	}

	logger := slog.New(handler)

	slog.SetDefault(logger)

	return logger

}

func newDevHandler(opts Options) slog.Handler {
	return tint.NewHandler(os.Stdout, &tint.Options{
		Level:      opts.Level,
		TimeFormat: time.RFC3339,
		AddSource:  true,
		ReplaceAttr: func(groups []string, attr slog.Attr) slog.Attr {
			if attr.Key == slog.TimeKey {
				return attr
			}
			return attr
		},
	})
}

func newProdHandler(opts Options) slog.Handler {
	file, err := os.OpenFile(
		opts.FilePath,
		os.O_APPEND|os.O_CREATE|os.O_WRONLY,
		0644,
	)
	if err != nil {
		panic("cannot open log file " + err.Error())
	}

	writer := io.MultiWriter(file, os.Stdout)

	return slog.NewJSONHandler(writer, &slog.HandlerOptions{
		Level:     opts.ProdLevel,
		AddSource: true,
	})
}
