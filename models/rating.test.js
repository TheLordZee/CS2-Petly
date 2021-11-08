"use strict";

const {
    NotFoundError,
    BadRequestError
} = require("../expressError")
const db = require("../db")
const Rating = require("./rating")
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

/************************************** rate */

describe("rate", function(){
    test("user rating works", async function(){
      const res = await Rating.rate('user', 1, 2, 1, "They are a good user.")
      expect(res).toEqual({
        reviewerId: 1,
        posterId: 2,
        rating: 1,
        review: 'They are a good user.'
      })
    })
  
    test("organization rating works", async function(){
      const res = await Rating.rate('organization', 1, "FY77", 1, "They are a good organization.")
      expect(res).toEqual({
        reviewerId: 1,
        posterId: "FY77",
        rating: 1,
        review: 'They are a good organization.'
      })
    })
  
    test("fails with invalid type", async function(){
      try{
        const res = await Rating.rate('Nope', 1, "FY77", 1, "They are a good organization.")
      } catch(e){
        expect(e instanceof BadRequestError).toBeTruthy();
      }
    })

    test("fails if reviewer does not exist", async function(){
        try{
            const res = await Rating.rate('user', 99, 2, 1, "They are a good user.")
        } catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    })

    test("fails if user poster does not exist", async function(){
        try{
            const res = await Rating.rate('user', 1, 99, 1, "They are a good user.")
        } catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    })
})