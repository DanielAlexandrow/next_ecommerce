FROM mcr.microsoft.com/devcontainers/php:1-8.3

# Install Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Verify Node.js installation
RUN node --version

# Install pnpm
RUN npm install -g pnpm

# Verify pnpm installation
RUN pnpm --version

# Install PostgreSQL client and development libraries
RUN apt-get update && apt-get install -y libpq-dev

# Install PostgreSQL PHP extensions
RUN docker-php-ext-install pgsql pdo_pgsql

# Configure Xdebug
RUN echo "xdebug.mode = debug" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.start_with_request = yes" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.client_port = 9003" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.idekey = VSCODE" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.client_host = host.docker.internal" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.discover_client_host = true" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.log = /tmp/xdebug.log" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.log_level = 0" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.include_path = /var/www/html" >> /usr/local/etc/php/conf.d/xdebug.ini

# Set working directory
WORKDIR /var/www/html

# Copy the entire project
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache  /var/www/html/

# Install Composer dependencies
RUN composer install

# Install Node.js dependencies and build
RUN pnpm install

# Install Node.js dependencies and build
RUN pnpm build



# Expose port 8000
EXPOSE 8000

# Start PHP server
#CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]