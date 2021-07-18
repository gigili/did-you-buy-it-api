CREATE TABLE lists.list_color
(
    userid UUID    NOT NULL
        CONSTRAINT FK_ListColor_User REFERENCES users."user" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    listid UUID    NOT NULL
        CONSTRAINT FK_ListColor_List REFERENCES lists.list (id) ON UPDATE CASCADE ON DELETE CASCADE,
    color  CHAR(6) NOT NULL,

    CONSTRAINT PK_ListColor PRIMARY KEY (userid, listid)
);