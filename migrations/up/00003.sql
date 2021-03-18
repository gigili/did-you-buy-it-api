CREATE TABLE lists.list_item
(
    id              UUID         NOT NULL
        CONSTRAINT PK_ListItem PRIMARY KEY,
    listID          UUID         NOT NULL,
    userID          UUID         NOT NULL,
    purchasedUserID UUID         NULL,
    name            VARCHAR(255) NOT NULL,
    image           VARCHAR(255) NULL,
    is_repeating    BOOLEAN      NOT NULL
        CONSTRAINT DF_ListItem_IsRepeating DEFAULT false,
    purchased_at    TIMESTAMPTZ  NOT NULL
);

ALTER TABLE lists.list_item
    ADD CONSTRAINT FK_ListItem_User_UserID FOREIGN KEY (userID) REFERENCES users.user (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE lists.list_item
    ADD CONSTRAINT FK_ListItem_User_PurchasedUserID FOREIGN KEY (purchasedUserID) REFERENCES users.user (id) ON UPDATE CASCADE ON DELETE SET NULL;
