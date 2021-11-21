"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { isAdminOrUser, ensureAdmin, isUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Pet = require("../models/pet")
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: {
 *    firstName, 
 *    lastName, 
 *    username,
 *    address,
 *    email, 
 *    phone,
 *    birthDay,
 *    profilePic
 * }, token }
 *
 * Authorization required: Admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const user = await User.register(req.body);
      const token = createToken(user);
      return res.status(201).json({ user, token });
    } catch (err) {
      return next(err);
    }
});

/** GET / => { users: [ { 
 *      username,
   *    fullName, 
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic,
   *    pets
   * }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: Admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
    try {
      const users = await User.findAll();
      return res.json({ users });
    } catch (err) {
      return next(err);
    }
});

  /** GET /[username] => { user }
 *
 * Returns {  username,
   *    fullName, 
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic,
   *    pets 
   * }
   * 
   * Where pets is [{
   *    id, organizationId, userId,  url, type, species,  age, gender, size, coat, colors, name, description, photos, videos, status, uploaded
   * }, ...] 
 *
 * Authorization required: none
 **/

router.get("/:username", async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const pets = await Pet.getPetsByUploader(user.id, "user")
      user.pets = pets;
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
});

/** GET /[username]/pets => { pets }
 *
 * Returns {  
 *      pets: [{
   *    id, organizationId, userId,  url, type, species,  age, sex, size, coat, colors, name, description, photos, videos, status, uploaded
   * }, ...]
   * }
 *
 * Authorization required: none
 **/

router.get("/:username/pets", async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const pets = await Pet.getPetsByUploader(user.id, "user")
      return res.json({ pets });
    } catch (err) {
      return next(err);
    }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { 
   *    firstName, 
   *    lastName,
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic 
   * }
 *
 * Returns { 
 *  username,
   *    firstName, 
   *    lastName,
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic
   *  }
 *
 * Authorization required:  user or admin
 **/

router.patch("/:username", isAdminOrUser, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required:  user or admin
 **/

router.delete("/:username", isUser, async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
});

module.exports = router;