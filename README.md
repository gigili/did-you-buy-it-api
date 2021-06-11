# Did You Buy It?

![Repo size badge](https://img.shields.io/github/repo-size/gigili/did-you-buy-it-api?style=for-the-badge)
![Open issues badge](https://img.shields.io/github/issues/gigili/did-you-buy-it-api?style=for-the-badge)
![Licence badge](https://img.shields.io/github/license/gigili/did-you-buy-it-api?style=for-the-badge)
![Forks badge](https://img.shields.io/github/forks/gigili/did-you-buy-it-api?style=for-the-badge)

"Did You Buy It?" is a shopping list app designed to help people keep track of stuff they need to buy.

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

# Local setup

To get started on developing this project firs you need to do

```sh
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

    //TODO

Install

```shell
php vendor/bin/migrate install pgsql://postgres:postgres@localhost/dybi -vvv
```

Reset

```shell
php vendor/bin/migrate install pgsql://postgres:postgres@localhost/dybi -vvv
```

Migrate up

```shell
php vendor/bin/migrate up pgsql://postgres:postgres@localhost/dybi -vvv
```

### Note

On Windows machines you need the `php` prefix before calling the `vendor/bin/migrate`.

# Tests

    //TODO

## Notes

* Mailhog url: `localhost:${MAILHOG_PORT}`
* PGAdmin url: `localhost:${PGADMIN_PORT}`
* I've set up a virtual host on my machine to be able to easily run the app

### Virtual Host Example:

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

Don't forget to add this to your hosts

* `/etc/hosts` on Linux / OSx and
* `C:\Windows\System32\drivers\etc\hosts` on Windows) file:

```apacheconf
127.0.0.1 dybi.local
127.0.0.1 www.dybi.local
```
