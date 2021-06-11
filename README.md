# Did You Buy It?
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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
    * [x] List users that have access to the list
    * [x] Allow other users access to the list
    * [x] Remove users from the list
    * [ ] Autocomplete endpoint for when adding users ?
* [ ] List items
    * [x] Add list item
        * [x] Add images
    * [x] Update list item
        * [x] Mark item as bought
            * [ ] Send notification to other users of the list
    * [x] Delete list item
    * [x] Add / remove images
* [ ] User profile
    * [x] Edit profile
    * [x] Delete profile
        * [ ] Send an email notification that the account has been closed
* [ ] Reset password

# Local setup

To get started on developing this project firs you need to do

```sh
  git clone https://github.com/gigili/did-you-buy-it-api
  cd did-you-buy-it-api
```

Then rename `.env.example` into `.env` file and fill in all the values.

To run the app:

* Start up docker container for the Postgres database

```shell
    docker-compose up
```

* Run the Express app with:

```sh
  npm install
  npm run dev
```

If you do not specify a `PORT` value in the `.env` file the app should be available at `http://localohst:3030`

# Notes

For Docker:

```sh
  # might need to run as sudo and run only once
  docker volume create --name dybi-pg -d local    
```

## Contributors ✨

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