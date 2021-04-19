-- Migrate to Version 1
CREATE SCHEMA users;
CREATE TYPE users.user_status AS ENUM ('0', '1');
CREATE TABLE users.user
(
    id             UUID              NOT NULL PRIMARY KEY,
    name           VARCHAR(255)      NOT NULL,
    email          VARCHAR(200)      NOT NULL
        CONSTRAINT UQ_User_Email UNIQUE,
    username       VARCHAR(50)       NOT NULL
        CONSTRAINT UQ_User_username UNIQUE,
    password       VARCHAR(300)      NOT NULL,
    image          VARCHAR(500)      NULL,
    activation_key VARCHAR(15)       NULL,
    status         users.user_status NOT NULL
        CONSTRAINT DF_User_Status DEFAULT '0'
);