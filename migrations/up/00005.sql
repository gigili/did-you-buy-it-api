ALTER TABLE lists.list
    ALTER COLUMN created_at SET DEFAULT current_timestamp;
ALTER TABLE lists.list_user
    ALTER COLUMN created_at SET DEFAULT current_timestamp;