"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */


describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
            username: "tu",
            firstName: "TUF",
            lastName: "TUL",
            email: "tuser@user.com",
            password: "tPassword",
            address: "Texas",
            phone: "111111111",
            birthDay: "01/01/1000",
            profilePic:"tpp"
        })
        .set("authorization", `Bearer ${a1Token}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
            id: 5,
            username: "tu",
            firstName: "TUF",
            lastName: "TUL",
            email: "tuser@user.com",
            address: "Texas",
            phone: "111111111",
            birthDay: "01/01/1000",
            profilePic:"tpp"
      }, token: expect.any(String),
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for nonadmin user", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u1Token}`);;
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
        users: [
            {
              id: 4,
              firstName: 'Admin',
              lastName: 'Admin',
              username: 'Admin',
              address: 'Indiana',
              email: 'admin3@user.com',
              phone: '3333333333',
              birthDay: '11/04/2021',
              profilePic: null
            },
            {
              id: 1,
              firstName: 'U1F',
              lastName: 'U1L',
              username: 'u1',
              address: 'Texas',
              email: 'user1@user.com',
              phone: '111111111',
              birthDay: '01/01/1000',
              profilePic: 'pp1'
            },
            {
              id: 2,
              firstName: 'U2F',
              lastName: 'U2L',
              username: 'u2',
              address: 'Indiana',
              email: 'user2@user.com',
              phone: '2222222222',
              birthDay: '02/02/2000',
              profilePic: 'pp2'
            },
            {
              id: 3,
              firstName: 'U3F',
              lastName: 'U3L',
              username: 'u3',
              address: 'Florida',
              email: 'user3@user.com',
              phone: '3333333333',
              birthDay: '03/03/3000',
              profilePic: 'pp3'
            }
          ]
    });
  });

  test("unauth for nonadmin users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    
    expect(resp.body).toEqual({
        user: {
            id: 1,
            firstName: 'U1F',
            lastName: 'U1L',
            username: 'u1',
            address: 'Texas',
            email: 'user1@user.com',
            phone: '111111111',
            birthDay: '01/01/1000',
            profilePic: 'pp1',
            pets: [
                {
                    id: 1,
                    organizationId: null,
                    userId: 1,
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
                    uploaded: '2021-05-11T04:00:00.000Z'
                }
            ]
        }
    });
  });

  test("works for admins", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
        user: {
            id: 1,
            firstName: 'U1F',
            lastName: 'U1L',
            username: 'u1',
            address: 'Texas',
            email: 'user1@user.com',
            phone: '111111111',
            birthDay: '01/01/1000',
            profilePic: 'pp1',
            pets: [ {
                id: 1,
                organizationId: null,
                userId: 1,
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
                uploaded: '2021-05-11T04:00:00.000Z'
            }]
        }
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /users/:username/pets */

describe("GET /users/:username/pets", function () {
    test("works", async function () {
      const resp = await request(app)
          .get(`/users/u1/pets`);
      
      expect(resp.body).toEqual({
          pets: [{
            id: 1,
            organizationId: null,
            userId: 1,
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
            uploaded: '2021-05-11T04:00:00.000Z'
        }]
      });
    });
  
  
    test("not found if user not found", async function () {
      const resp = await request(app)
          .get(`/users/nope`)
          .set("authorization", `Bearer ${a1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  });

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    
    expect(resp.body).toEqual({
        user: {
            id: 1,
            firstName: 'New',
            lastName: 'U1L',
            username: 'u1',
            address: 'Texas',
            email: 'user1@user.com',
            phone: '111111111',
            birthDay: '01/01/1000',
            profilePic: 'pp1'
        }
    });
  });

  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
        user: {
            id: 1,
            firstName: 'New',
            lastName: 'U1L',
            username: 'u1',
            address: 'Texas',
            email: 'user1@user.com',
            phone: '111111111',
            birthDay: '01/01/1000',
            profilePic: 'pp1'
        }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/users/nope`)
        .send({
          firstName: "Nope",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
        user: {
            id: 1,
            firstName: 'U1F',
            lastName: 'U1L',
            username: 'u1',
            address: 'Texas',
            email: 'user1@user.com',
            phone: '111111111',
            birthDay: '01/01/1000',
            profilePic: 'pp1'
        }
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});


/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

