# --- CONFIGURATION ---
DB_CONTAINER=stream-postgres
DB_USER=postgres
DB_NAME=stream

# --- POSTGRES TERMINAL ---

db:
	@echo "Connecting to $(DB_NAME) database..."
	@winpty docker exec -it $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME) -P pager=off

db-tables:
	@winpty docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\dt+"

db-stat:
	@winpty docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) \
		-c "SELECT pid, usename, state, query FROM pg_stat_activity WHERE datname = '$(DB_NAME)';"

db-logs:
	docker logs -f $(DB_CONTAINER)

db-restart:
	docker-compose restart postgres

db-backup:
	docker exec $(DB_CONTAINER) pg_dumpall -c -U $(DB_USER) > dump_$(shell date +%Y%m%d_%H%M%S).sql