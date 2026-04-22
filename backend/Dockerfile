# ========================================
# STAGE 1: Build Dependencies
# ========================================
FROM php:8.3-fpm as dependencies

# Instalar extensões PHP necessárias para Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo \
    pdo_mysql \
    mbstring \
    xml \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Instalar Composer (gerenciador de pacotes PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ========================================
# STAGE 2: Application Runtime
# ========================================
FROM php:8.3-fpm

# Variáveis de configuração
ENV APP_HOME=/app

# Copiar extensões do stage anterior
COPY --from=dependencies /usr/local/lib/php /usr/local/lib/php
COPY --from=dependencies /usr/local/etc/php /usr/local/etc/php
COPY --from=dependencies /usr/bin/composer /usr/bin/composer

# Criar user www-data com permissões corretas
RUN useradd -m -u 1000 app || true

# Definir diretório de trabalho
WORKDIR $APP_HOME

# Copiar código da aplicação
COPY --chown=app:app . .

# Instalar dependências PHP via Composer como app user
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Definir permissões para diretórios do Laravel (storage precisa de escrita)
RUN chown -R app:app storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Mudar para app user
USER app

# PHP-FPM listens na porta 9000 (interna do container)
EXPOSE 9000

# Comando padrão (inicia PHP-FPM)
CMD ["php-fpm"]
