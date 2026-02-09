FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/worker/main.go

FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache \
    ffmpeg \
    ca-certificates \
    tzdata

COPY --from=builder /app/main .

RUN mkdir -p /var/www/media /app/logs /app/configs

ENV APP_CONFIG=/app/configs/app.yaml
ENV TZ=Asia/Ho_Chi_Minh

CMD ["./main"]
