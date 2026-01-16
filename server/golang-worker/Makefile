BINARY_NAME=worker-app
MAIN_PATH=./cmd/worker/main.go

all: build

build:
	@echo "=> Building binary..."
	go build -o bin/${BINARY_NAME} ${MAIN_PATH}

run:
	@echo "=> Starting Worker..."
	go run ${MAIN_PATH}

watch:
	@air

test:
	@echo "=> Running tests..."
	go test -v ./...

tidy:
	@go mod tidy
	@go mod vendor

clean:
	@echo "=> Cleaning up..."
	@rm -rf bin/
	@rm -f ${BINARY_NAME}

help:
	@echo "Usage:"
	@sed -n 's/^##//p' ${MAKEFILE} | column -t -s ':' |  sed -e 's/^/ /'