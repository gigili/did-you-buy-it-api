-- Put here your base SQL
BEGIN;
SELECT 'CREATE DATABASE dybi'
WHERE NOT EXISTS(SELECT FROM pg_database WHERE datname = 'dybi');
COMMIT;

