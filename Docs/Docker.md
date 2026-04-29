# 🐳 Docker & Containerization Guidelines

## 🤖 Instruções para IA (Copilot/Cursor)
Ao gerar Dockerfiles ou ficheiros Docker Compose para este projeto, segue rigorosamente estas normas de DevOps:

### 🏗️ 1. Estrutura do Dockerfile
- **Multi-stage Builds**: Obrigatório para Frontend (Angular) e Backend (Laravel) para reduzir o tamanho da imagem final.
- **Base Images**: Usa imagens oficiais e leves (ex: `php:8.2-fpm-alpine` ou `node:20-alpine`).
- **Layers Optimization**: Agrupa comandos `RUN` para minimizar o número de camadas (layers).
- **User Root**: Nunca corras a aplicação como root dentro do contentor. Cria um utilizador de sistema (ex: `www-data` ou `node`).

### 📦 2. Docker Compose (Orquestração Local)
- **Nomes de Serviços**: Usa nomes semânticos: `frontend`, `backend`, `db`.
- **Networks**: Todos os serviços devem estar na mesma rede interna (ex: `contactus-network`).
- **Restart Policy**: Usa `restart: unless-stopped` para serviços de infraestrutura.
- **Volumes**: 
  - Usa *Bind Mounts* para desenvolvimento (hot-reload).
  - Usa *Named Volumes* para persistência de dados da base de dados.

### 🔐 3. Segurança e Variáveis de Ambiente
- **.dockerignore**: Garante que `node_modules`, `vendor`, `.git` e ficheiros `.env` não são copiados para a imagem.
- **Build-time Secrets**: Não coloques passwords em instruções `ENV` do Dockerfile. Usa ficheiros `.env` via Docker Compose.
- **Portas**: Expõe apenas as portas estritamente necessárias (80, 443, 8000).

### 🛠️ 4. Configurações Específicas
- **Laravel (Backend)**: 
  - Instalar extensões PHP necessárias (pdo_mysql, gd, zip).
  - Configurar `opcache` para produção.
- **Angular (Frontend)**: 
  - Estágio 1: Build com `npm run build`.
  - Estágio 2: Servir ficheiros estáticos com `Nginx` (configuração customizada para SPA).

---

## 📋 Comandos Rápidos de Referência (Cheatsheet)

| Objetivo | Comando |
| :--- | :--- |
| Subir ambiente completo | `docker-compose up -d` |
| Reconstruir imagens | `docker-compose build --no-cache` |
| Ver logs em tempo real | `docker-compose logs -f` |
| Entrar num contentor | `docker exec -it <nome_servico> sh` |
| Limpar tudo (Prune) | `docker system prune -a` |
