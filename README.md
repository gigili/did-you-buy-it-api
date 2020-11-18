# Did you buy it?

"Did you buy it?" is a shopping list app designed to help people keep track of stuff they need to buy. 

# Features
  * [x] Login
  * [x] Register 
    * [ ] Send an activation email
  * [x] Lists
    * [x] Create list
    * [x] Update list
    * [x] Delete list
    * [x] List users that have access to the list
    * [x] Allow other users access to the list
    * [x] Remove users from the list
  * [ ] List items
    * [x] Add list item
        * [ ] Add images
    * [x] Update list item
        * [ ] Mark item as bought
    * [x] Delete list item
    * [ ] Add / remove images
  * [ ] User profile
    * [ ] Edit profile
    * [ ] Delete profile

# Local setup

To get started on developing this project firs you need to do

```sh
  git clone https://github.com/gigili/did-you-buy-it-api
  cd did-you-buy-it
```

Then you need to import the database from `assets/dybi.sql` file.

Example of import via CLI
```sh
  mysql -u {mysql_user} -p {db_name} < assets/dybi.sql
```

Then rename `.env.example` into `.env` file and fill in all the values

After that you can run:

```sh
  npm install
  npm run dev
```

If you do not specify a `PORT` value in the `.env` file the app will be available at `http://localohst:3030`
