# Did you buy it?

"Did you buy it?" is a shopping list app designed to help people keep track of stuff they need to buy. 

# Features
  * [x] Login
  * [x] Register 
  * [ ] Lists
    * [x] Create list
    * [x] Update list
    * [x] Delete list
    * [x] List users that have access to the list
    * [x] Allow other users access to the list
    * [x] Remove users from the list
  * [ ] List items
    * [ ] Add list item
    * [ ] Update list item
    * [ ] Delete list item
  * [ ] User profile

# Local setup

To get started on developing this project firs you need to do

```sh
  git clone https://github.com/gigili/did-you-buy-it-api
  cd did-you-buy-it
```

Than you need to import the database from `assets/dybi.sql` file.

Example of import via CLI
```sh
  mysql -u {mysql_user} -p {db_name} < assets/dybi.sql
```

Than rename `.env.example` into `.env` file and fill in all the values

After that you can run:

```sh
  npm install
  npm run dev
```

If you do not specife a `PORT` value in the `.env` file the app will be available at `http://localohst:3030`
