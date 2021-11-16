"use strict";

const { BadRequestError } = require("../expressError");
const makeFilterQuery = require("./filter")

describe("filter", function(){
    test("works", function(){
        const filter = {
            breed: ["Cocker Spaniel"],
            tag: ["cute", "happy"],
            environment: ["children"],
            attribute: ["spayed"]
        }

        const query = makeFilterQuery(filter)
        expect(query).toEqual(
            {
                query: ` JOIN pet_breeds ON pet_breeds.pet_id = p.id JOIN breeds ON breeds.id = pet_breeds.breed_id JOIN pet_tags ON pet_tags.pet_id = p.id JOIN tags ON tags.id = pet_tags.tag_id JOIN pet_environments ON pet_environments.pet_id = p.id JOIN environments ON environments.id = pet_environments.environment_id JOIN pet_attributes ON pet_attributes.pet_id = p.id JOIN attributes ON attributes.id = pet_attributes.attribute_id WHERE breeds.name ILIKE $1 AND tags.name ILIKE $2 AND tags.name ILIKE $3 AND environments.name ILIKE $4 AND attributes.name ILIKE $5`,
                vals: [ '%Cocker Spaniel%', '%cute%', '%happy%', '%children%', '%spayed%' ]
            }
        )
    })

    test("other filters works", function(){
        const filter = {
            type: ["dog"],
            sex: ["Female"]
        }

        const query = makeFilterQuery(filter)
        expect(query).toEqual(
            {
                query: ' WHERE p.type ILIKE $1 AND p.sex ILIKE $2',
                vals: [ '%dog%', '%Female%' ]
            }
        )
    })

    test("fails with bad filter", function(){
        const filter = {
            no: "yes"
        }
        try{
            const query = makeFilterQuery(filter)
        } catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
        
    })
})