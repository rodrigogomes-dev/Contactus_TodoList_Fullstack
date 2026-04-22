.PHONY: help docker-build docker-up docker-down docker-logs docker-ps docker-clean docker-rebuild docker-shell-backend docker-shell-frontend docker-shell-db docker-migrate docker-seed

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)Comandos Docker - TodoList Contactus Fullstack$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-30s$(NC) %s\n", $$1, $$2}'

# ========================================
# Build & Setup
# ========================================
docker-build: ## Constrói todas as imagens Docker
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build --no-cache

docker-build-quick: ## Constrói imagens (com cache)
	@echo "$(BLUE)Building Docker images (quick)...$(NC)"
	docker-compose build

# ========================================
# Container Lifecycle
# ========================================
docker-up: ## Inicia todos os containers
	@echo "$(GREEN)Starting containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Containers iniciados!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:4200$(NC)"
	@echo "$(BLUE)Backend API: http://localhost:8000/api$(NC)"

docker-up-build: ## Build + Inicia containers
	docker-compose up -d --build

docker-down: ## Para todos os containers
	@echo "$(BLUE)Stopping containers...$(NC)"
	docker-compose down

docker-down-volumes: ## Para containers e remove volumes (⚠️ apaga dados!)
	@echo "$(RED)⚠️  Removing containers and volumes...$(NC)"
	docker-compose down -v

# ========================================
# Monitoring
# ========================================
docker-ps: ## Lista containers em execução
	@docker-compose ps

docker-logs: ## Mostra logs de todos os containers (Ctrl+C para sair)
	docker-compose logs -f

docker-logs-backend: ## Logs do backend
	docker-compose logs -f backend

docker-logs-frontend: ## Logs do frontend
	docker-compose logs -f frontend

docker-logs-database: ## Logs da database
	docker-compose logs -f database

docker-logs-nginx: ## Logs do nginx
	docker-compose logs -f nginx

# ========================================
# Shell Access
# ========================================
docker-shell-backend: ## Acesso shell ao backend (PHP)
	docker-compose exec backend bash

docker-shell-frontend: ## Acesso shell ao frontend (Node)
	docker-compose exec frontend sh

docker-shell-db: ## Acesso ao MySQL
	docker-compose exec database mysql -u todolist_user -ptodolist_password db_todolist_contactus

# ========================================
# Database Operations
# ========================================
docker-migrate: ## Roda migrations do Laravel
	docker-compose exec backend php artisan migrate --force

docker-migrate-fresh: ## Fresh migrations (⚠️ apaga tabelas!)
	docker-compose exec backend php artisan migrate:fresh --force

docker-seed: ## Executa seeders
	docker-compose exec backend php artisan db:seed

docker-migrate-seed: ## Migrations + Seeders
	docker-compose exec backend php artisan migrate --force && docker-compose exec backend php artisan db:seed

# ========================================
# Testing
# ========================================
docker-test-backend: ## Roda testes PHPUnit
	docker-compose exec backend php artisan test

docker-test-frontend: ## Roda testes Vitest
	docker-compose exec frontend npm run test:ci

# ========================================
# Utilities
# ========================================
docker-clean: ## Remove imagens e containers sem uso
	@echo "$(BLUE)Cleaning up Docker...$(NC)"
	docker system prune -f

docker-rebuild: ## Reconstrói (sem cache) e inicia tudo
	$(MAKE) docker-down
	$(MAKE) docker-build
	$(MAKE) docker-up

docker-stats: ## Mostra usage de CPU/Memory
	docker stats

# ========================================
# Laravel Artisan
# ========================================
docker-artisan: ## Executa comando artisan (ex: make docker-artisan CMD="tinker")
	docker-compose exec backend php artisan $(CMD)

docker-composer: ## Executa composer (ex: make docker-composer CMD="require package/name")
	docker-compose exec backend composer $(CMD)

# ========================================
# Frontend npm
# ========================================
docker-npm: ## Executa npm command (ex: make docker-npm CMD="install package")
	docker-compose exec frontend npm $(CMD)

docker-npm-build: ## Build da aplicação Angular
	docker-compose exec frontend npm run build

docker-npm-dev: ## Inicia dev server (watch mode)
	docker-compose exec frontend npm run dev

# ========================================
# Database Backup
# ========================================
docker-db-backup: ## Faz backup da database
	@mkdir -p ./database-backups
	docker-compose exec database mysqldump -u todolist_user -ptodolist_password db_todolist_contactus > ./database-backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup criado em ./database-backups/$(NC)"

docker-db-restore: ## Restaura database (FILE=./path/to/backup.sql)
	@if [ -z "$(FILE)" ]; then echo "$(RED)Erro: FILE não foi fornecido (ex: make docker-db-restore FILE=./backup.sql)$(NC)"; exit 1; fi
	docker-compose exec -T database mysql -u todolist_user -ptodolist_password db_todolist_contactus < $(FILE)
	@echo "$(GREEN)✓ Database restaurada$(NC)"

# ========================================
# Documentation
# ========================================
docker-info: ## Mostra info dos containers
	docker-compose config

docker-version: ## Mostra versões
	@echo "$(BLUE)Docker Version:$(NC)"
	@docker --version
	@echo "$(BLUE)Docker Compose Version:$(NC)"
	@docker-compose --version

# ========================================
# Complete Setup (First Time)
# ========================================
docker-init: ## Setup completo (build + up + migrate + seed)
	@echo "$(GREEN)Initializing Docker environment...$(NC)"
	$(MAKE) docker-build
	$(MAKE) docker-up
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 10
	$(MAKE) docker-migrate
	$(MAKE) docker-seed
	@echo "$(GREEN)✓ Setup completo!$(NC)"
	@echo "$(BLUE)Acesso em: http://localhost:4200$(NC)"
