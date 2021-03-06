"use strict";

const db = require("../db")
const bcrypt = require("bcrypt")
const { encrypt, decrypt } = require("../helpers/encrypt")
const { sqlForPartialUpdate } = require("../helpers/sql")
const { BadRequestError, NotFoundError, ForbiddenError, UnauthorizedError } = require("../expressError")
const {Tags, Breeds, Attributes, Environments} = require("./attribute")
const User = require("./user")
const makeFilterQuery = require("../helpers/filter")

const { BCRYPT_WORK_FACTOR } = require("../config")

/** Related functions for users */

class Pet {
    /** Create pet with data.
   *
   * Returns {  
   *    id, organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded 
   * }
   *
   * Throws BadRequestError on duplicates.
   **/
  static async create(
        {
          organizationId, 
          userId, 
          url="", 
          type, 
          species, 
          age, 
          sex, 
          size, 
          coat, 
          colors, 
          name="N/A", 
          description="", 
          photos="", 
          videos="", 
          status="",
          location="",
          uploaded,
          tags=[],
          breeds=[],
          attributes=[],
          environments=[]
        }){
          if(!uploaded){
            let currentDate = new Date();
            let cDay = currentDate.getDate();
            let cMonth = currentDate.getMonth() + 1;
            let cYear = currentDate.getFullYear();
            uploaded = cDay + "/" + cMonth + "/" + cYear
          }
          const res = await db.query(
                `INSERT INTO pets
                (organization_id, 
                  user_id, 
                  url, 
                  type, 
                  species, 
                  age, 
                  sex, 
                  size, 
                  coat, 
                  colors, 
                  name, 
                  description, 
                  photos, 
                  videos, 
                  status, 
                  location,
                  uploaded)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id,
                    organization_id AS "organizationId", 
                    user_id AS "userId", 
                    url, 
                    type, 
                    species, 
                    age, 
                    sex, 
                    size, 
                    coat, 
                    colors, 
                    name, 
                    description, 
                    photos, 
                    videos, 
                    status, 
                    location,
                    uploaded`,
                [
                  organizationId, 
                  userId, 
                  url, 
                  type, 
                  species, 
                  age, 
                  sex, 
                  size, 
                  coat, 
                  colors, 
                  name, 
                  description, 
                  photos, 
                  videos, 
                  status, 
                  location,
                  uploaded
                ]
            );
      const pet = res.rows[0];
      await Tags.addAllToPet(pet.id, tags)
      await Breeds.addAllToPet(pet.id, breeds)
      await Environments.addAllToPet(pet.id, environments)
      await Attributes.addAllToPet(pet.id, attributes)

      pet.tags = await Tags.getByPetId(pet.id)
      pet.breeds = await Breeds.getByPetId(pet.id)
      pet.environments = await Environments.getByPetId(pet.id)
      pet.attributes = await Attributes.getByPetId(pet.id)

      return pet;
  }

    /** Find all pets.
   *
   * Returns [{  
   *    id, organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded 
   * }, ...]
   * 
   * Can filter by tag, breed, attribute, environment, type, species, sex, size, coat
   **/

  static async findAll(filter = {}, page = 0) {
    const query = (Object.keys(filter).length > 0) ? makeFilterQuery(filter) : {query:"", vals: []};
    const res = await db.query(
          `SELECT 
            p.id, 
            p.organization_id AS "organizationId", 
            p.user_id AS "userId",  
            p.url, 
            p.type, 
            p.species, 
            p.age, 
            p.sex, 
            p.size, 
            p.coat, 
            p.colors, 
            p.name, 
            p.description, 
            p.photos, 
            p.videos, 
            p.status, 
            p.location,
            p.uploaded
           FROM pets AS p
           ${query.query}
           LIMIT 20
           OFFSET ${page * 20}`,
          query.vals
    );

    return res.rows;
  }


  /** Given an attribute and a name, returns an array of pets with that attribute */
  static async findByAttribute(attribute, name) {
    const res = await db.query(
      `SELECT p.id, 
        p.organization_id AS "organizationId", 
        p.user_id AS "userId", 
        p.url, 
        p.type, 
        p.species, 
        p.age, 
        p.sex, 
        p.size, 
        p.coat, 
        p.colors, 
        p.name, 
        p.description, 
        p.photos, 
        p.videos, 
        p.status, 
        p.location,
        p.uploaded
       FROM pets p
       JOIN pet_${attribute}s pa
       ON pa.pet_id = p.id
       JOIN ${attribute}s a
       ON pa.${attribute}_id = a.id
       WHERE a.name = $1`,
       [name]
    );

    return res.rows;
  }


   /** Given an id, return data about pet.
   *
   * Returns { id, organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, attributes, breeds, environments }
   *    where tags, attributes, breeds, and environments are [name, ...]
   *
   * Throws NotFoundError if user not found.
   **/

    static async get(id) {
      const res = await db.query(
            `SELECT id, 
              organization_id AS "organizationId", 
              user_id AS "userId", 
              url, 
              type, 
              species, 
              age, 
              sex, 
              size, 
              coat, 
              colors, 
              name, 
              description, 
              photos, 
              videos, 
              status, 
              location,
              uploaded
             FROM pets AS p
             WHERE id = $1`,
          [id]
      );
  
      const pet = res.rows[0];
      if (!pet) throw new NotFoundError(`No pet with id ${id}`);

      const tags = await Tags.getByPetId(id);
      const attributes = await Attributes.getByPetId(id);
      const breeds = await Breeds.getByPetId(id)
      const environments = await Environments.getByPetId(id);

      pet.tags = tags;
      pet.attributes = attributes;
      pet.breeds = breeds;
      pet.environments = environments;
      return pet;
    }
  
  /** Given an user or organization's id, return data about pets they have uploaded.
   *
   * Returns { 
   *    id, organizationId, userId,  url, type, species,  age, sex, size, coat, colors, name, description, photos, videos, status, uploaded 
   *  }
   *
   * Throws NotFoundError if user not found.
   **/

  static async getPetsByUploader(id, type) {
    let exists = Pet.checkExists(id)
    if(!exists) throw new NotFoundError(`No Pet Found With id Of: ${id}`);
    let selection = (type === "user") ? "user_id" : "organization_id";
    const res = await db.query(
          `SELECT id, 
            organization_id AS "organizationId", 
            user_id AS "userId",  
            url, 
            type, 
            species,  
            age, 
            sex, 
            size, 
            coat, 
            colors, 
            name, 
            description, 
            photos, 
            videos, 
            status, 
            location,
            uploaded
           FROM pets AS p
           WHERE ${selection} = $1`,
        [id]
    );

    const pets = res.rows;
    
    return pets;
  }  

  /** Update pet data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   {  
   *      url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status
   *  }
   *
   * Returns { 
   *    id, organizationId, userId,  url, type, species,  age, sex, size, coat, colors, name, description, photos, videos, status, uploaded 
   *  }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(id, data) {
    let pet;
    if(data.id || data.organizationId || data.userId || data.uploaded) throw new ForbiddenError("Attempt to change columns that aren't allowed to be change")
    const petData = {...data}
    delete petData.environments;
    delete petData.breeds;
    delete petData.tags;
    delete petData.attributes;
    let dataNum = [...Object.keys(petData)].length
    if(dataNum > 0){
    const { setCols, values } = sqlForPartialUpdate(
        petData,
        {
          organizationId: "organization_id",
          userId: "user_id",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE pets
                      SET ${setCols}
                      WHERE id = ${usernameVarIdx}
                      RETURNING id, 
                        organization_id AS "organizationId",
                        user_id AS "userId",
                        url,
                        type,
                        species,
                        age,
                        sex,
                        size,
                        coat,
                        colors,
                        name,
                        description,
                        photos,
                        videos,
                        status,
                        location,
                        uploaded`;
    const result = await db.query(querySql, [...values, id]);
    pet = result.rows[0];
    } else {
      pet = await Pet.get(id)
    }

    if (!pet) throw new NotFoundError(`No pet with id: ${id}`);

    if(data.tags){
      await Tags.addAllToPet(id, data.tags)
    }
    if(data.breeds){
      await Breeds.addAllToPet(id, data.breeds)
    }
    if(data.environments){
      await Environments.addAllToPet(id, data.environments)
    }
    if(data.attributes){
      await Attributes.addAllToPet(id, data.attributes)
    }

    const tags = await Tags.getByPetId(id);
    const attributes = await Attributes.getByPetId(id);
    const breeds = await Breeds.getByPetId(id)
    const environments = await Environments.getByPetId(id);
    pet.tags = tags
    pet.attributes = attributes
    pet.breeds = breeds
    pet.environments = environments
    console.log(pet)

    return pet;
  }

  /** Delete given pet from database; returns undefined. 
   * 
   * Throws NotFoundError if pet not found.
  */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM pets
           WHERE id = $1
           RETURNING id`,
        [id],
    );
    const pet = result.rows[0];

    if (!pet) throw new NotFoundError(`No pet with id: ${id}`);
  }

  /** Given a petId, attribute type, and attribute name, adds the proper attribute to the pet if it exists
   * 
   * Type can be tag, breed, attribute, or environment
   * 
   * Throws BadRequestError if invalid type and NotFoundError if the petId or attribute is not found
   */
  static async addAttribute(petId, type, attribute){
    let res;
    switch(type){
      case "tag":
        const tagId = await Tags.getId(attribute);
        res = Tags.addToPet(petId, tagId);
        break;
      case "breed":
        const breedId = await Breeds.getId(attribute);
        res = Breeds.addToPet(petId, breedId);
        break;
      case "attribute":
        const attributeId = await Attributes.getId(attribute);
        res = Attributes.addToPet(petId, attributeId);
        break;
      case "environments":
        const environmentId = await Environments.getId(attribute);
        res = Environments.addToPet(petId, environmentId);
        break;
      default:
        throw new BadRequestError("Invalid type")
    }

    if(!res) throw new NotFoundError("Either pet id or attribute not found")

    return res;
  }

  static async checkExists(id){
    let res = await db.query(
      `SELECT id
      FROM pets
      WHERE id = $1`,
      [id]
    )
    if(res.rows[0]) return true;
    return false;
  }
}

module.exports = Pet;