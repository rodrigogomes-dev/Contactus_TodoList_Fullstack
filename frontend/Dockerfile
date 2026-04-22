# ========================================
# STAGE 1: Build Angular Application
# ========================================
FROM node:20-alpine as builder

WORKDIR /app

# Copiar ficheiros do projeto (frontend/frontend contém o código)
COPY frontend/frontend/package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY frontend/frontend/ .

# Build da aplicação (produção)
RUN npm run build

# ========================================
# STAGE 2: Nginx Runtime
# ========================================
FROM nginx:alpine

# Copiar ficheiros construídos do stage anterior
# dist/todo-angular/browser é o output do build
COPY --from=builder /app/dist/todo-angular/browser /usr/share/nginx/html

# Copiar configuração nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta (Nginx irá servir na porta 80 dentro do container)
EXPOSE 80

# Comando padrão (inicia nginx em foreground)
CMD ["nginx", "-g", "daemon off;"]
