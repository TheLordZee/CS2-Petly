const bcrypt = require("bcrypt");
const { encrypt } = require("../helpers/encrypt")

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config")

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM pets");
    await db.query("ALTER SEQUENCE pets_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM types");
    await db.query("ALTER SEQUENCE types_id_seq RESTART WITH 1");

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
  }

  await db.query(
    `INSERT INTO types (name)
    VALUES ('dog', 'cat')`
  )

  await db.query(
    `INSERT INTO pets(user_id, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status)
    VALUES (1, 'url1', 1, 'dog', 'Young')`
  )
  
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