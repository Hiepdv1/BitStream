FROM golang:1.23.4-alpine AS builder

WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd/worker/main.go

FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=builder /app/main .

# COPY .env .env

CMD ["./main"]
