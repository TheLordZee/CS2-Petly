"use strict";

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
                query: ` JOIN pet_breeds AS breed ON pets.id = breed.pet_id JOIN breeds ON breed.breed_id = breeds.id  JOIN pet_tags AS tag ON pets.id = tag.pet_id JOIN tags ON tag.tag_id = tags.id  JOIN pet_environments AS environment ON pets.id = environment.pet_id JOIN environments ON environment.environment_id = environments.id  JOIN pet_attributes AS attribute ON pets.id = attribute.pet_id JOIN attributes ON attribute.attribute_id = attributes.id  WHERE breeds.name ILIKE $1 OR tags.name ILIKE $2 OR tags.name ILIKE $3 OR environments.name ILIKE $4 OR attributes.name ILIKE $5`,
                vals: [ '%Cocker Spaniel%', '%cute%', '%happy%', '%children%', '%spayed%' ]
            }
        )
    })
})