DROP TABLE IF EXISTS pet_attributes CASCADE;
DROP TABLE IF EXISTS pet_environments CASCADE;
DROP TABLE IF EXISTS pet_breeds CASCADE;
DROP TABLE IF EXISTS pet_tags CASCADE;
DROP TABLE IF EXISTS environments CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS breeds CASCADE;
DROP TABLE IF EXISTS user_ratings CASCADE;
DROP TABLE IF EXISTS organization_ratings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS organizition_ratings CASCADE;
DROP TYPE IF EXISTS ANIMAL_TYPE;
DROP TYPE IF EXISTS SEX;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password TEXT NOT NULL,
  username TEXT NOT NULL,
  address TEXT,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  phone TEXT,
  birth_day TEXT NOT NULL,
  profile_pic TEXT
);

CREATE TYPE SEX AS ENUM ('male', 'female', 'unknown');
CREATE TYPE ANIMAL_TYPE AS ENUM ('dog', 'cat', 'rabbit', 'small & furry', 'horse', 'bird', 'scales, fins & other', 'barnyard');

CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  organization_id TEXT,
  user_id int REFERENCES users ON DELETE CASCADE,
  url TEXT,
  type ANIMAL_TYPE NOT NULL,
  species TEXT NOT NULL,
  age TEXT NOT NULL,
  sex SEX NOT NULL,
  size TEXT NOT NULL,
  coat TEXT NOT NULL,
  colors JSON NOT NULL,
  name TEXT DEFAULT 'N/A',
  description TEXT,
  photos JSON,
  videos JSON,
  status TEXT DEFAULT 'Adoptable',
  location TEXT NOT NULL,
  uploaded TEXT NOT NULL DEFAULT CURRENT_DATE
  CHECK ((organization_id != NULL OR user_id != NULL) 
    AND NOT (organization_id != NULL AND user_id != NULL))
);

CREATE TABLE organization_ratings(
  reviewer_id INT REFERENCES users ON DELETE CASCADE,
  poster_id TEXT,
  rating INT NOT NULL,
  review TEXT,
  PRIMARY KEY (reviewer_id, poster_id)
);

CREATE TABLE user_ratings(
  reviewer_id INT REFERENCES users ON DELETE CASCADE,
  poster_id INT REFERENCES users ON DELETE CASCADE,
  rating INT NOT NULL,
  review TEXT,
  PRIMARY KEY (reviewer_id, poster_id)
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE pet_tags (
  pet_id int REFERENCES pets ON DELETE CASCADE,
  tag_id int REFERENCES tags ON DELETE CASCADE,
  PRIMARY KEY (pet_id, tag_id)
);

CREATE TABLE breeds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE pet_breeds (
  pet_id int REFERENCES pets ON DELETE CASCADE,
  breed_id int REFERENCES breeds ON DELETE CASCADE,
  PRIMARY KEY (pet_id, breed_id)
);

CREATE TABLE attributes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE pet_attributes (
  pet_id int REFERENCES pets ON DELETE CASCADE,
  attribute_id int REFERENCES attributes ON DELETE CASCADE,
  PRIMARY KEY (pet_id, attribute_id)
);

CREATE TABLE environments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE pet_environments (
  pet_id int REFERENCES pets ON DELETE CASCADE,
  environment_id int REFERENCES environments ON DELETE CASCADE,
  PRIMARY KEY (pet_id, environment_id)
);

CREATE TABLE organizition_ratings (
  organization_id int,
  user_id int REFERENCES users ON DELETE CASCADE,
  rating int NOT NULL,
  review TEXT,
  PRIMARY KEY (organization_id, user_id)
);