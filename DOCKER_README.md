# 🐳 Docker Setup - TodoList Contactus Fullstack

**Executar toda a aplicação (Backend + Frontend + BD) com um único comando.**

---

## ⚙️ Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado

Verificar:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Iniciar (3 segundos)

```bash
docker-compose up -d
```

Pronto! A aplicação está em:
- **Frontend:** http://localhost:8000
- **API:** http://localhost:8000/api

---

## 📊 Arquitetura

```
Cliente (Browser) → http://localhost:8000
                        ↓
                  Nginx Reverse Proxy
                    /          \
              /api/*             /*
                /                  \
         Laravel Backend        Angular Frontend
           (PHP-FPM)             (Nginx)
             9000                  80
                |
            MySQL BD
             3306
```

**4 containers automáticos:**
1. **MySQL** - Base de dados (`db_todolist_contactus`)
2. **Backend** - Laravel + API (`todolist-backend`)
3. **Frontend** - Angular compilado (`todolist-frontend`)
4. **Proxy** - Nginx roteador (`todolist-proxy`)

---

## 📋 Comandos Úteis

### Iniciar/Parar

```bash
# Inicia
docker-compose up -d

# Para
docker-compose down

# Reinicia
docker-compose restart
```

### Monitoramento

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Logs de um container específico
docker-compose logs -f backend
```

### Acesso a Shells

```bash
# Shell do Backend (Laravel commands)
docker-compose exec backend bash

# Shell da BD (MySQL CLI)
docker-compose exec database mysql -u todolist_user -p

# Migrations/Seeders
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
```

### Reconstruir

```bash
# Rebuild completo (código mudou)
docker-compose up --build -d

# Rebuild sem cache
docker-compose up --build --no-cache -d
```

---

## ❌ Troubleshooting

**Porta 8000 já em uso:**
```bash
docker-compose down
```

**BD não inicializa:**
```bash
docker-compose down -v   # Remove volumes (apaga dados)
docker-compose up -d     # Recria tudo
```

**Ver erro específico:**
```bash
docker-compose logs -f backend   # ou database, frontend
```

### Database

```bash
make docker-migrate        # Roda migrations
make docker-migrate-fresh  # Fresh (apaga tabelas!)
make docker-seed           # Executa seeders
make docker-db-backup      # Faz backup SQL
make docker-db-restore FILE=./backup.sql  # Restaura backup
```

### Testes

```bash
make docker-test-backend   # PHPUnit tests
make docker-test-frontend  # Vitest (Angular)
```

### Utilities

```bash
make docker-artisan CMD="tinker"              # Executa Artisan
make docker-composer CMD="require package"    # Executa Composer
make docker-npm CMD="install package"         # Executa npm
make docker-npm-build                         # Build Angular
make docker-clean          # Remove imagens/containers não usados
make docker-stats          # CPU/Memory usage
```

---

## 🌐 Acessar a Aplicação

| Serviço | URL | Porta |
|---------|-----|-------|
| **Frontend (Angular)** | http://localhost:8000 | 8000 |
| **Backend API** | http://localhost:8000/api | 8000 |
| **MySQL Direct** | localhost:3306 | 3306 |
| **PHP-FPM** | localhost:9000 | 9000 (interno) |

---

## 🔧 Configuração

### Variáveis de Ambiente

As variáveis estão em `.env.docker`. Para mudar:

```bash
# Editar o docker-compose.yml ou .env.docker
nano .env.docker

# Depois rebuild
make docker-rebuild
```

### Database Credentials

```
Host: localhost (ou database dentro de Docker)
User: todolist_user
Password: todolist_password
Database: db_todolist_contactus
Port: 3306
```

### Laravel App Key

Se a aplicação falhar com erro de encryption:

```bash
# Gerar nova chave
make docker-artisan CMD="key:generate"

# Ou dentro do container
docker-compose exec backend php artisan key:generate
```

---

## 📝 Desenvolvimento

### Hot-Reload Frontend

Para ativar hot-reload durante desenvolvimento, edite `docker-compose.yml`:

```yaml
frontend:
  # ... resto da config
  volumes:
    - ./frontend/frontend:/app
    - /app/node_modules
    - /app/dist
```

Depois:
```bash
make docker-rebuild
make docker-npm-dev  # Inicia Angular dev server
```

### Desenvolvimento Backend

O backend tem volumes habilitados por padrão:

```yaml
backend:
  volumes:
    - ./backend:/app
    - /app/vendor
```

Mudanças nos ficheiros `.php` refletem imediatamente.

---

## 🐛 Troubleshooting

### "Port 8000 already in use"

```bash
# Ver o que está usando a porta
lsof -i :8000
# Ou matá-lo
kill -9 <PID>

# Mudar porta em docker-compose.yml
# ports:
#   - "8080:80"  # Usar 8080 em vez de 8000
```

### "Cannot connect to MySQL"

```bash
# Verificar se database está healthy
docker-compose ps

# Ver logs da database
make docker-logs-database

# Esperar 10s e tentar novamente
sleep 10 && make docker-migrate
```

### "Permission denied on storage/"

```bash
# Dentro do backend container
make docker-shell-backend
chmod -R 775 storage bootstrap/cache
chown -R app:app storage bootstrap/cache
```

### "Composer install failed"

```bash
# Limpar composer cache
docker-compose exec backend composer clear-cache

# Reinstalar
docker-compose exec backend composer install
```

### Tests failing

```bash
# Verificar que database está pronto
make docker-test-backend

# Se falhar, tentar seed
make docker-migrate
make docker-seed
```

---

## 📊 Verificação de Saúde

```bash
# Health check endpoint
curl http://localhost:8000/health

# Ver status dos containers
make docker-ps

# Ver recursos usados
make docker-stats

# Verificar logs
make docker-logs
```

---

## 🧹 Limpeza

### Parar containers mas manter volumes (dados)
```bash
make docker-down
```

### Parar e remover volumes (APAGA DADOS!)
```bash
make docker-down-volumes
```

### Limpar imagens não usadas
```bash
make docker-clean
```

### Começar do zero
```bash
make docker-down-volumes
make docker-rebuild
make docker-init
```

---

## 📦 Produção

Para deploy em produção:

1. **Remover volumes** de desenvolvimento no `docker-compose.yml`
2. **Definir** `APP_ENV=production` em variáveis
3. **Remover** `APP_DEBUG=true`
4. **Usar** reverse proxy externo (nginx/Apache) para SSL/TLS
5. **Backup regular** das volumes MySQL

```bash
# Exemplo docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Notes

- Mudar as credenciais padrão de MySQL em produção
- Usar `.env` secreto (não commitar)
- Ativar HTTPS no reverse proxy externo
- Manter images atualizadas: `docker pull image:tag`
- Usar secrets do Docker para credenciais em Swarm/Kubernetes

---

## 📚 Referências

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Docs](https://docs.docker.com/compose)
- [Laravel Docker Setup](https://laravel.com/docs/deployment)
- [Angular Docker Build](https://angular.io/guide/build)
- [Nginx FastCGI](https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html)

---

## 💡 Tips

- Use `make docker-logs-backend` durante desenvolvimento para debug
- Mantenha `.dockerignore` atualizado para builds mais rápidos
- Use `.env.docker` para diferentes ambientes
- Backup database regularmente: `make docker-db-backup`
- Limpe containers não usados regularmente: `make docker-clean`

---

**Criado**: 2026-04-22  
**Ultima atualização**: 2026-04-22
