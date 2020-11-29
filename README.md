# Did you buy it?

"Did you buy it?" is a shopping list app designed to help people keep track of stuff they need to buy. 

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
    * [ ] Delete profile

# Local setup

To get started on developing this project firs you need to do

```sh
  git clone https://github.com/gigili/did-you-buy-it-api
  cd did-you-buy-it
```

Then rename `.env.example` into `.env` file and fill in all the values

After that you can run:

```sh
  npm install
  npm run dev
```

If you do not specify a `PORT` value in the `.env` file the app will be available at `http://localohst:3030`
