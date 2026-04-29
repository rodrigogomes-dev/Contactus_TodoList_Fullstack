# ========================================
# Application Runtime
# ========================================
FROM php:8.3-fpm

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev \
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

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Variáveis de configuração
ENV APP_HOME=/app
WORKDIR $APP_HOME

# Criar user app
RUN useradd -m -u 1000 app || true

# Copiar apenas o código do backend
COPY --chown=app:app ./backend .

# Instalar dependências do Laravel
RUN composer install --optimize-autoloader --no-interaction

# Permissões
RUN chown -R app:app storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
