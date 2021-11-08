"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

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

/************************************** POST /rate */

describe("POST /rate", function(){
    test("works", async function(){
        const res = await request(app)
            .post("/rate")
            .send({
                type: "user",
                posterId: 2,
                rating: 1,
                review: 'They are a good user.'
            })
            .set("authorization", `Bearer ${u1Token}`);
            
        expect(res.body).toEqual({
            posterId: 2,
            rating: 1,
            review: 'They are a good user.',
            reviewerId: 2
        })
    })
})