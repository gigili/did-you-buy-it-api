FROM php:8.0.3-apache
COPY . /var/www/html
WORKDIR /var/www/html
COPY --from=composer /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get install -y git zip unzip
RUN composer install --prefer-dist --no-progress
RUN pecl install xdebug && docker-php-ext-enable xdebug
RUN a2enmod rewrite
RUN composer update