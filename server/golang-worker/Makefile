BINARY_NAME=worker-app
DOCKER_IMAGE_NAME=golang-worker
MAIN_PATH=./cmd/worker/main.go

SQLC=sqlc
SCHEMA_PATH=./db/schema
QUERIES_PATH=./db/queries

all: build

## build: build worker docker image
docker-build:
	@echo "=> Building docker image..."
	docker compose build ${DOCKER_IMAGE_NAME}

## run: run worker
docker-run:
	@echo "=> Starting Worker..."
	docker compose up -d ${DOCKER_IMAGE_NAME}

## stop: stop worker
docker-stop:
	@echo "=> Stopping Worker..."
	docker compose stop ${DOCKER_IMAGE_NAME}

## restart: restart worker
docker-restart:
	@echo "=> Restarting Worker..."
	docker compose restart ${DOCKER_IMAGE_NAME}

## logs: docker logs
docker-logs:
	@echo "=> Docker logs..."
	docker compose logs -f ${DOCKER_IMAGE_NAME}

## build: build worker binary
build-binary:
	@echo "=> Building binary..."
	go build -o bin/${BINARY_NAME} ${MAIN_PATH}

## run: run worker
run:
	@echo "=> Starting Worker..."
	go run ${MAIN_PATH}


## watch: run worker with air
watch:
	@air

## generate: generate sqlc code
gen:
	@echo "=> Generating sqlc code..."
	${SQLC} generate

## verify-schema: sanity check schema files exist
verify-schema:
	@test -d ${SCHEMA_PATH} || (echo "Missing schema directory" && exit 1)
	@test -d ${QUERIES_PATH} || (echo "Missing queries directory" && exit 1)

## tidy: tidy go modules
tidy:
	@go mod tidy
	@go mod vendor

## test: run tests
test:
	@echo "=> Running tests..."
	go test -v ./...

## clean: clean build artifacts
clean:
	@echo "=> Cleaning up..."
	@rm -rf bin/

## rebuild: clean + generate + build
rebuild: clean verify-schema generate build

## help: show help
help:
	@echo "Usage:"
	@sed -n 's/^##//p' ${MAKEFILE} | column -t -s ':' | sed -e 's/^/ /'
