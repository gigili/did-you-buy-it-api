-- Migrate to Version 3
CREATE SCHEMA lists;
CREATE TABLE lists.list
(
    id         UUID         NOT NULL
        CONSTRAINT PK_List PRIMARY KEY,
    userID     UUID         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL
);

BEGIN;
ALTER TABLE lists.list
    ADD CONSTRAINT FK_List_User FOREIGN KEY (userID) REFERENCES users.user (id) ON UPDATE CASCADE ON DELETE CASCADE;
COMMIT;