"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require("../expressError")
const db = require("../db")
const User = require("./user")
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommon")

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const date = new Date(`2021-01-01T05:00:00.000Z`)

/************************************** authenticate */

describe("authenticate", function () {
    test("works", async function () {
      const user = await User.authenticate("u1", "password1");
      expect(user).toEqual({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        address: "address1",
        phone: "(111)111-1111",
        birthDay: date,
        profilePic: "pp1"
      });
    });
  
    test("unauth if no such user", async function () {
      try {
        await User.authenticate("nope", "password");
        fail();
      } catch (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      }
    });
  
    test("unauth if wrong password", async function () {
      try {
        await User.authenticate("c1", "wrong");
        fail();
      } catch (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      }
    });
});

/************************************** register */

describe("register", function () {
    const newUser = {
        username: "test",
        firstName: "TF",
        lastName: "TL",
        email: "tu@email.com",
        address: "taddress",
        phone: "(111)111-1111",
        birthDay: date,
        profilePic: "tpp"
    };
  
    test("works", async function () {
      let user = await User.register({
        ...newUser,
        birthDay: '01/01/2021',
        password: "password"
      });
      expect(user).toEqual(newUser);
      const found = await db.query("SELECT * FROM users WHERE username = 'test'");
      expect(found.rows.length).toEqual(1);
      expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });
  
    test("bad request with dup data", async function () {
      try {
        await User.register({
          ...newUser,
          password: "password",
        });
        await User.register({
          ...newUser,
          password: "password",
        });
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });