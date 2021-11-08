"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Pet = require("../models/pet")
const { createToken } = require("../helpers/tokens");

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
  
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    address: "Texas",
    phone: "111111111",
    birthDay: "01/01/1000",
    profilePic:"pp1"
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    address: "Indiana",
    phone: "2222222222",
    birthDay: "02/02/2000",
    profilePic:"pp2"
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    address: "Florida",
    phone: "3333333333",
    birthDay: "03/03/3000",
    profilePic:"pp3"
  });

  await User.register({
    username: "Admin",
    firstName: "Admin",
    lastName: "Admin",
    email: "admin3@user.com",
    password: "adminPassword",
    address: "Indiana",
    phone: "3333333333",
    birthDay: "11/04/2021",
  });

  await Pet.create({
      userId: 1,
      organizationId: null,
      url: 'url1',
      type: 'dog',
      species: 'dog',
      age: 'Young',
      sex: 'Male',
      size: 'large',
      coat: 'long',
      colors: 'gold',
      name: 'Jack',
      description: 'He is a very good boi',
      photos: 'photos1',
      videos: 'videos1',
      status: 'adoptable',
      date: `2021-01-01T05:00:00.000Z`
  })
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

const u1Token = createToken({ username: "u1", id: 2 });
const a1Token = createToken({ username: "Admin", id: 1 });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
};