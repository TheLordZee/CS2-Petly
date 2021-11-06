"use strict";

/** Routes for pets. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, isAdminOrUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Pet = require("../models/pet")
const petNewSchema = require("../schemas/petNew.json");
const petUpdateSchema = require("../schemas/petUpdate.json");

const router = express.Router();

/** POST / { pet }  => { pet }
 *
 * Adds a new pet. 
 *
 * This returns the newly created pet:
 *  {
 *      pet: {
 *          organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, breeds, environments, attributes 
 *      }
 * }
 *  
 * Where tags, attributes, breeds, and environments are [name, ...]
 *
 * Authorization required: Logged In
 **/

 router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, petNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      
      const pet = await Pet.create(req.body)
      return res.status(201).json({ pet });
    } catch (err) {
      return next(err);
    }
});

/** GET / => { pets: [ { 
 *      organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, breeds, environments, attributes 
   * }, ... ] }
 *
 * Returns list of all pets.
 *
 **/

 router.get("/", async function (req, res, next) {
    try {
      const pets = await Pet.findAll();
      return res.json({ pets });
    } catch (err) {
      return next(err);
    }
});

  /** GET /[id] => { pet }
 *
 * Returns {  
 *  organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, breeds, environments, attributes 
   * }
   *
   *  Where tags, attributes, breeds, and environments are [name, ...]
   * 
 * Authorization required: none
 **/

router.get("/:id", async function (req, res, next) {
    try {
      const pet = await Pet.get(req.params.id);
      return res.json({ pet });
    } catch (err) {
      return next(err);
    }
});

/** PATCH /[username]/pets/[petId] { pet } => { pet }
 *
 * Can only edit pets that are uploaded by users
 * 
 * Data can include:
 *   { 
   *    url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, breeds, environments, attributes 
   * }
 *
 * Returns { 
*     organizationId, userId, url, type, species, age, sex, size, coat, colors, name, description, photos, videos, status, uploaded, tags, breeds, environments, attributes 
*  }
 *
 * Where tags, attributes, breeds, and environments are [name, ...]
 * 
 * Authorization required:  user or admin
 **/

 router.patch("/:username/:id", isAdminOrUser, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, petUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const pet = await Pet.update(req.params.id, req.body);
      return res.json({ pet });
    } catch (err) {
        console.log(err)
      return next(err);
    }
});

/** DELETE /[username]/[id]  =>  { deleted: id }
 *
 * Authorization required:  user or admin
 **/

 router.delete("/:username/:id", isAdminOrUser, async function (req, res, next) {
    try {
      await Pet.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
});


module.exports = router;