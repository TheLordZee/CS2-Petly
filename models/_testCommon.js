const bcrypt = require("bcrypt");
const { encrypt } = require("../helpers/encrypt")

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config")

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pet_attributes");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pet_breeds");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pet_tags");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pet_environments");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM attributes");
    await db.query("ALTER SEQUENCE attributes_id_seq RESTART WITH 1");  
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM breeds");
    await db.query("ALTER SEQUENCE breeds_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM environments");
    await db.query("ALTER SEQUENCE environments_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM tags");
    await db.query("ALTER SEQUENCE tags_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pets");
    await db.query("ALTER SEQUENCE pets_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");

    await db.query(`
          INSERT INTO users(first_name, 
            last_name,
            password, 
            username, 
            address, 
            email, 
            phone, 
            birth_day, 
            profile_pic)
          VALUES ( 'U1F', 'U1L', $1, 'u1', $2, 'u1@email.com', $3, '01/01/2021', 'pp1'),
                 ('U2F', 'U2L', $4, 'u2', $5, 'u2@email.com', $6, '01/01/2021', 'pp2')
          RETURNING username`,
        [
          await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
          encrypt("address1"),
          encrypt('(111)111-1111'),
          await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
          encrypt("address2"),
          encrypt('(222)222-2222')
        ]
    );
  
    await db.query(
      `INSERT INTO pets(user_id, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded)
      VALUES 
            (1, 'url1', 'dog', 'dog', 'Young', 'Male', 'large', 'long', 'gold', 'Jack', 'He is a very good boi', 'photos1', 'videos1', 'adoptable', '01/01/2021'),
            (2, 'url2', 'rabbit', 'rabbit', 'Mature', 'Female', 'small', 'long', 'black', 'Jello', 'She is an adorable fuzzball', 'photos1', 'videos2', 'adoptable', '01/01/2021')`
    )
  
    await db.query(
      `INSERT INTO breeds (name)
        VALUES('Golden Retriever'),
              ('American Fuzzy Lop')`
    )
    
    await db.query(
      `INSERT INTO attributes (name)
        VALUES('spayed_neutered'),
              ('special_needs')`
    )
  
    await db.query(
      `INSERT INTO environments (name)
        VALUES('children'),
              ('dogs')`
    )
  
    await db.query(
      `INSERT INTO tags (name)
        VALUES('cute'),
              ('playful')`
    )
  
    await db.query(
      `INSERT INTO pet_breeds 
        VALUES (1, 1),
              (2, 2)`
    )
  
    await db.query(
      `INSERT INTO pet_attributes
        VALUES (1, 1),
              (2, 2)`
    )
  
    await db.query(
      `INSERT INTO pet_environments
        VALUES (1, 2),
              (2, 1)`
    )
  
    await db.query(
      `INSERT INTO pet_tags
        VALUES (1, 1),
              (1, 2),
              (2, 1),
              (2, 2)`
    )
  }

  

  async function commonBeforeEach() {
    await db.query("BEGIN");
  }
  
  async function commonAfterEach() {
    await db.query("ROLLBACK");
  }
  
  async function commonAfterAll() {
    await db.end();
  }
  
  
  module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  };