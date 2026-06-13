APP_NAME=nest-api
DOCKER_IMAGE_NAME=nest-api
MAIL_WORKER_NAME=mail-worker
APP_PORT=3001

## all: build
all: build

kill-port:
	@echo "=> Checking and clearing port $(APP_PORT)..."
	@npx kill-port $(APP_PORT) || true

## docker-build: build nest docker image
docker-build:
	@echo "=> Building docker image..."
	docker compose build ${DOCKER_IMAGE_NAME} ${MAIL_WORKER_NAME}

docker-build-nest:
	@echo "=> Building docker image..."
	docker compose build ${DOCKER_IMAGE_NAME}

docker-build-mail:
	@echo "=> Building docker image..."
	docker compose build ${MAIL_WORKER_NAME}

## docker-run: run nest
docker-run:
	@echo "=> Starting Nest API..."
	docker compose up -d ${DOCKER_IMAGE_NAME} ${MAIL_WORKER_NAME}

docker-run-nest:
	@echo "=> Starting Nest API..."
	docker compose up -d ${DOCKER_IMAGE_NAME}

docker-run-mail:
	@echo "=> Starting Mail Worker..."
	docker compose up -d ${MAIL_WORKER_NAME}

## docker-stop: stop nest
docker-stop:
	@echo "=> Stopping Nest API..."
	docker compose stop ${DOCKER_IMAGE_NAME} ${MAIL_WORKER_NAME}

## docker-restart: restart nest
docker-restart:
	@echo "=> Restarting Nest API..."
	docker compose restart ${DOCKER_IMAGE_NAME} ${MAIL_WORKER_NAME}

## docker-logs: docker logs
docker-logs:
	@echo "=> Docker logs..."
	docker compose logs -f ${DOCKER_IMAGE_NAME} ${MAIL_WORKER_NAME}

## build: build nest app
build:
	@echo "=> Building nest app..."
	yarn build

## run: run nest api
run:
	@echo "=> Starting Nest API..."
	yarn start

## watch: run nest api in watch mode
watch: kill-port
	@echo "=> Starting Nest API in watch mode..."
	yarn start:dev

## watch-mail: run mail worker in watch mode
watch-mail:
	@echo "=> Starting Mail Worker in watch mode..."
	yarn worker:mail

## prisma-gen: generate prisma client
prisma-gen:
	@echo "=> Generating Prisma Client..."
	yarn prisma generate

## prisma-migrate: migrate database (dev)
prisma-migrate:
	@echo "=> Running Prisma migrate dev..."
	yarn prisma migrate dev

## prisma-studio: open prisma studio
prisma-studio:
	@echo "=> Opening Prisma Studio..."
	yarn prisma studio

## tidy: install dependencies
tidy:
	@echo "=> Installing dependencies..."
	yarn install

## test: run tests
test:
	@echo "=> Running tests..."
	yarn test

## clean: clean build artifacts
clean:
	@echo "=> Cleaning up..."
	@rm -rf dist/
	@rm -rf node_modules/

## rebuild: clean + generate + build
rebuild: clean tidy prisma-gen build

## help: show help
help:
	@echo "Usage:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'
