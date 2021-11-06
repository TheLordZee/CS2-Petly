"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Pet = require("../models/pet")

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

/************************************** POST /pets */


describe("POST /pets", function () {
  test("works", async function () {
    const resp = await request(app)
        .post("/pets")
        .send({
            userId: 2,
            organizationId: null,
            url: 'newUrl',
            type: 'dog',
            species: 'dog',
            age: 'Young',
            sex: 'Male',
            size: 'large',
            coat: 'long',
            colors: 'gold',
            name: 'Jack',
            description: 'He is a very good boi',
            photos: 'newPhotos',
            videos: 'newVideos',
            status: 'adoptable',
            uploaded: '11/01/2021'
        })
        .set("authorization", `Bearer ${a1Token}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      pet: {
        id: 2,
        userId: 2,
        organizationId: null,
        url: 'newUrl',
        type: 'dog',
        species: 'dog',
        age: 'Young',
        sex: 'Male',
        size: 'large',
        coat: 'long',
        colors: 'gold',
        name: 'Jack',
        description: 'He is a very good boi',
        photos: 'newPhotos',
        videos: 'newVideos',
        status: 'adoptable',
        attributes: [],
        breeds: [],
        environments: [],
        tags: [],
        uploaded: '2021-11-01T04:00:00.000Z'
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/pets")
        .send({
            userId: 2,
            organizationId: null,
            url: 'newUrl',
            type: 'dog',
            species: 'dog',
            age: 'Young',
            sex: 'Male',
            size: 'large',
            coat: 'long',
            colors: 'gold',
            name: 'Jack',
            description: 'He is a very good boi',
            photos: 'newPhotos',
            videos: 'newVideos',
            status: 'adoptable',
            uploaded: '11/01/2021'
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("works for nonadmin user", async function () {
    const resp = await request(app)
        .post("/pets")
        .send({
            userId: 2,
            organizationId: null,
            url: 'newUrl',
            type: 'dog',
            species: 'dog',
            age: 'Young',
            sex: 'Male',
            size: 'large',
            coat: 'long',
            colors: 'gold',
            name: 'Jack',
            description: 'He is a very good boi',
            photos: 'newPhotos',
            videos: 'newVideos',
            status: 'adoptable',
            uploaded: '11/01/2021'
        })
        .set("authorization", `Bearer ${u1Token}`);;
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
          pet: {
            id: 3,
            userId: 2,
            organizationId: null,
            url: 'newUrl',
            type: 'dog',
            species: 'dog',
            age: 'Young',
            sex: 'Male',
            size: 'large',
            coat: 'long',
            colors: 'gold',
            name: 'Jack',
            description: 'He is a very good boi',
            photos: 'newPhotos',
            videos: 'newVideos',
            status: 'adoptable',
            attributes: [],
            breeds: [],
            environments: [],
            tags: [],
            uploaded: '2021-11-01T04:00:00.000Z'
          }
        });
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/pets")
        .send({
          url: "u-new",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/pets")
        .send({
            userId: "22",
            organizationId: "ST77",
            url: 'newUrl',
            type: 'dog',
            species: 'dog',
            age: 'Young',
            sex: 'Male',
            size: 'large',
            coat: 'long',
            colors: 'gold',
            name: 'Jack',
            description: 'He is a very good boi',
            photos: 'newPhotos',
            videos: 'newVideos',
            status: 'adoptable',
            uploaded: '11/01/2021'
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /pets", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .get("/pets")
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
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
              uploaded: '2021-06-11T04:00:00.000Z'
            }
        ]
    });
  });

  test("works for nonadmin users", async function () {
    const resp = await request(app)
        .get("/pets")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
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
              uploaded: '2021-06-11T04:00:00.000Z'
            }
        ]
    });
  });

  test("works for anon", async function () {
    const resp = await request(app)
        .get("/pets");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
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
                  uploaded: '2021-06-11T04:00:00.000Z'
                }
            ]
        });
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

describe("GET /pets/:id", function () {
  test("works", async function () {
    const resp = await request(app)
        .get(`/pets/1`);
    
    expect(resp.body).toEqual({
        pet: {
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
            uploaded: '2021-06-11T04:00:00.000Z',
            tags: [],
            attributes: [],
            breeds: [],
            environments: []
        }
    });
  });

  
  test("not found if pet not found", async function () {
    const resp = await request(app)
        .get(`/pets/99`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /:username/:id", () => {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/1`)
        .send({
          name: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    
    expect(resp.body).toEqual({
        pet: {
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
            name: 'New',
            description: 'He is a very good boi',
            photos: 'photos1',
            videos: 'videos1',
            status: 'adoptable',
            uploaded: '2021-06-11T04:00:00.000Z',
            tags: [],
            attributes: [],
            breeds: [],
            environments: []
        }
    });
  });

  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/1`)
        .send({
          name: "New",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
        pet: {
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
            name: 'New',
            description: 'He is a very good boi',
            photos: 'photos1',
            videos: 'videos1',
            status: 'adoptable',
            uploaded: '2021-06-11T04:00:00.000Z',
            tags: [],
            attributes: [],
            breeds: [],
            environments: []
        }
    });
  });

  test("works with tag/breed/attribute/environment data", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/1`)
        .send({
          tags: ["Young", "Happy", "Playful"],
        })
        .set("authorization", `Bearer ${u1Token}`);
    
    expect(resp.body).toEqual({
        pet: {
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
            uploaded: '2021-06-11T04:00:00.000Z',
            tags: ["young", "happy", "playful"],
            attributes: [],
            breeds: [],
            environments: []
        }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/1`)
        .send({
          name: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such pet", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/99`)
        .send({
          name: "Nope",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/pets/u1/1`)
        .send({
          name: 42,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** DELETE /users/:username */

describe("DELETE /pets/:username/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/pets/u1/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/pets/u1/1`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/pets/u1/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if pet missing", async function () {
    const resp = await request(app)
        .delete(`/pets/u1/99`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

