-- Migrate to Version 0 
DROP TYPE users.user_status CASCADE;
DROP TABLE users.user CASCADE;
DROP SCHEMA users CASCADE;