DROP TABLE IF EXISTS pet_attributes CASCADE;
DROP TABLE IF EXISTS pet_environments CASCADE;
DROP TABLE IF EXISTS pet_breeds CASCADE;
DROP TABLE IF EXISTS pet_tags CASCADE;
DROP TABLE IF EXISTS environments CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS breeds CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS organizition_ratings CASCADE;
DROP TABLE IF EXISTS types;
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
  birth_day DATE NOT NULL,
  profile_pic TEXT
);

CREATE TYPE SEX AS ENUM ('Male', 'Female', 'Unknown');
CREATE TYPE ANIMAL_TYPE AS ENUM ('dog', 'cat', 'rabbit', 'small & furry', 'horse', 'bird', 'scales, fins & other', 'barnyard')


CREATE TABLE types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
)

CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  organization_id TEXT,
  user_id int REFERENCES users ON DELETE CASCADE,
  url TEXT,
  type INT REFERENCES types ON CASCADE DELETE,
  species TEXT NOT NULL,
  age TEXT NOT NULL,
  sex SEX NOT NULL,
  size TEXT NOT NULL,
  coat TEXT NOT NULL,
  colors TEXT NOT NULL,
  name TEXT DEFAULT 'N/A',
  desription TEXT,
  photos TEXT,
  videos TEXT,
  status TEXT NOT NULL,
  uploaded DATE NOT NULL DEFAULT CURRENT_DATE
  CHECK ((organization_id != NULL OR user_id != NULL) 
    AND NOT (organization_id != NULL AND user_id != NULL))
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
  attibute_id int REFERENCES attributes ON DELETE CASCADE,
  PRIMARY KEY (pet_id, attibute_id)
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