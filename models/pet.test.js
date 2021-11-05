"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require("../expressError")
const db = require("../db")
const Pet = require("./pet")
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

describe("get", function(){
    test("gets all", async function(){
        const pets = await Pet.findAll()
        expect(pets).toEqual([
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
              uploaded: date
            },
            {
              id: 2,
              organizationId: null,
              userId: 2,
              url: 'url2',
              type: 'rabbit',
              species: 'rabbit',
              age: 'Mature',
              sex: 'Female',
              size: 'small',
              coat: 'long',
              colors: 'black',
              name: 'Jello',
              description: 'She is an adorable fuzzball',
              photos: 'photos1',
              videos: 'videos2',
              status: 'adoptable',
              uploaded: date
            }
          ])
    })

    test("get with filter works", async function(){
      const pets = await Pet.findAll({breed: ['Golden Retriever']})
      expect(pets).toEqual([
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
          uploaded: date
        }
      ])
    })

    test("gets pet by id", async function(){
        const pet = await Pet.get(1);
        expect(pet).toEqual({
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
            uploaded: date,
            tags: [ 'cute', 'playful' ],
            attributes: [ 'spayed_neutered' ],
            breeds: [ 'Golden Retriever' ],
            environments: [ 'dogs' ]
        })
    })

    test("gets pets by user", async function(){
        const pets = await Pet.getPetsByUploader(1, "user")
        expect(pets).toEqual([
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
              uploaded: date
            }
        ])
    })
    test("gets pets by user fails if no such id", async function(){
        try{
            const pets = await Pet.getPetsByUploader(999, "user")
        } catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
        
    })
})

describe("create", function(){
    const newPet = {
        organizationId: null,
        userId: 1,
        url: 'url3',
        type: 'horse',
        species: 'horse',
        age: 'Young',
        sex: 'Male',
        size: 'large',
        coat: 'short',
        colors: 'black',
        name: 'Steve',
        description: 'Beautiful and majestic',
        photos: 'photos3',
        videos: 'videos3',
        status: 'adoptable',
        uploaded: date
    }

    test("works", async function(){
        let pet = await Pet.create(newPet);
        expect(pet).toEqual({
            id: 3,
            ...newPet,
            tags: [],
            breeds: [],
            environments: [],
            attributes: []
        })
        const found = await db.query("SELECT * FROM pets WHERE name = 'Steve'");
        expect(found.rows.length).toEqual(1);
    })

    test("works with attibutes", async function(){
      let pet = await Pet.create({
        ...newPet,
        tags: ["cute", "big"]
      });
      expect(pet).toEqual({
          id: 4,
          ...newPet,
          tags: ["cute", "big"],
          breeds: [],
          environments: [],
          attributes: []
      })
      const found = await db.query("SELECT * FROM pets WHERE name = 'Steve'");
      expect(found.rows.length).toEqual(1);
  })
})

/************************************** update */

describe("update", function () {
    const updateData = {
        age :"old", 
        size: "large", 
        coat: "long", 
        name: "Susan", 
        photos : '{"photos":["pic1", "pic2"]}', 
        videos : '{"videos": ["video1"]}', 
        status : "adopted"
    };
  
    test("works", async function () {
      let pet = await Pet.update(2, updateData);  
      expect(pet).toEqual({
        id: 2,
        organizationId: null,
        userId: 2,
        url: 'url2',
        type: 'rabbit',
        species: 'rabbit',
        sex: 'Female',
        colors: 'black',
        description: 'She is an adorable fuzzball',
        uploaded: date,
        ...updateData
      });
    });
    
  
    test("not found if no such pet", async function () {
      try {
        await Pet.update(99, {
          name: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request if no data", async function () {
      expect.assertions(1);
      try {
        await Pet.update(6, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
});
  
  /************************************** remove */
  
describe("remove", function () {
    test("works", async function () {
      await Pet.remove(1);
      const res = await db.query(
          "SELECT * FROM pets WHERE id=1");
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such pet", async function () {
      try {
        await Pet.remove(99);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});