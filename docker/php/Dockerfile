FROM php:8.1-apache

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        apt-utils \
        g++ \
        git \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libtidy-dev \
        libxml2-dev \
        libxslt-dev \
        libzip-dev\
        locales \
        unzip \
        vim \
    && rm -rf /var/lib/apt/lists/*

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    echo "fr_FR.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php \
    && php -r "unlink('composer-setup.php');" \
    && mv composer.phar /usr/local/bin/composer

RUN docker-php-ext-configure intl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install calendar dom gd intl mbstring opcache pdo pdo_mysql tidy xsl zip
RUN pecl install apcu && docker-php-ext-enable apcu

WORKDIR /var/www/othera