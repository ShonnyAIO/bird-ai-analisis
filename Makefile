.PHONY: install dev test build docker-up docker-down docker-dev

install:
	bun install

dev:
	bun dev

test:
	bun test

build:
	bun build src/index.ts --outdir ./api --target node --minify --bundle

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-dev:
	docker compose -f docker-compose.dev.yml up
