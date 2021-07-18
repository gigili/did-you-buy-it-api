# Did You Buy It?
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![Repo size badge](https://img.shields.io/github/repo-size/gigili/did-you-buy-it-api?style=for-the-badge)
![Open issues badge](https://img.shields.io/github/issues/gigili/did-you-buy-it-api?style=for-the-badge)
![Licence badge](https://img.shields.io/github/license/gigili/did-you-buy-it-api?style=for-the-badge)
![Forks badge](https://img.shields.io/github/forks/gigili/did-you-buy-it-api?style=for-the-badge)

"Did You Buy It?" is a shopping list app designed to help people keep track of stuff they need to buy.

# Local setup

To get started on developing this project firs you need to do

```shell
git clone https://github.com/gigili/did-you-buy-it-api
cd did-you-buy-it-api
```

Then rename `.env.example` into `.env` file and fill in all the values.

## To run the app:

* Start up docker containers

```shell
docker-compose up
```

# Migrations

To run the migration you need the `byjg/migration` and/or `byjg/migration-cli` package which gets installed when you
run `composer install`.

To set up your database to handle migrations check the [install](#Install-migrations)  section below, or if you need to
reset the migrations table check the [Reset section](#Reset-migration)

## Install migrations

```shell
php vendor/bin/migrate install
```

## Reset migrations

```shell
php vendor/bin/migrate reset
```

## Migrate up

```shell
php vendor/bin/migrate up
```

## Migrate down

```shell
php vendor/bin/migrate down
```

### Note

On Windows machines you **need** the `php` prefix before calling the `vendor/bin/migrate`. You might also need to pass
in the `postgres` connection string in your command which looks like:

```
pgsql://postgres:postgres@localhost/dybi -vvv
```

where `-vvv` indicates verbose output of the migrate command.

# Tests

    //TODO

# Notes

* I've set up a virtual host on my machine to be able to easily run the app

## Virtual Host Example:

```apacheconf
<VirtualHost *:80>
    ServerAdmin admin@example.com
    DocumentRoot "/Projects/did-you-buy-it-api"
    ServerName dybi.local
    ServerAlias www.dybi.local
    ErrorLog "/Projects/did-you-buy-it-api/logs/error.log"
    CustomLog "/Projects/did-you-buy-it-api/logs/access.log" common
    <Directory "/Projects/did-you-buy-it-api">
        Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted          
    </Directory>
</VirtualHost>
```

Don't forget to add

```apacheconf
127.0.0.1 dybi.local
127.0.0.1 www.dybi.local
```

this to your hosts file

* `/etc/hosts` on Linux / OSx and
* `C:\Windows\System32\drivers\etc\hosts` on Windows

# Features

* [x] Login
* [x] Register
    * [x] Send an activation email
    * [x] Activate user account
* [x] Lists
    * [x] Create list
    * [x] Update list
    * [x] Delete list
    * [X] List users that have access to the list
    * [x] Allow other users access to the list
    * [x] Remove users from the list
    * [x] Autocomplete endpoint for when adding users ?
* [ ] List items
    * [x] Add list item
        * [x] Add images
    * [x] Update list item
        * [x] Mark item as bought
            * [ ] Send notification to other users of the list
    * [x] Delete list item
    * [x] Add / remove images
* [x] User profile
    * [x] Edit profile
    * [x] Delete profile
        * [x] Send an email notification that the account has been closed
    * [x] Reset password

# Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.forestsoft.de"><img src="https://avatars.githubusercontent.com/u/132578?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian</b></sub></a><br /><a href="https://github.com/gigili/did-you-buy-it-api/commits?author=Forestsoft-de" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!