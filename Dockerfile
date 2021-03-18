FROM php:8.0-cli-alpine

RUN apk add --no-cache  $PHPIZE_DEPS bash \
    && pecl install xdebug \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && mkdir /app

COPY . /app
WORKDIR /app/
RUN composer update --dev


