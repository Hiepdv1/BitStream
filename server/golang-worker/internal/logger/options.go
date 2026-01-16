package logger

import "log/slog"

type Options struct {
	Env       string
	Level     slog.Level
	FilePath  string
	AppName   string
	ProdLevel slog.Level
}
