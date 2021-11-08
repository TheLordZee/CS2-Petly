"use strict";

/** Routes for ratings. */

const jsonschema = require("jsonschema");
const { ensureLoggedIn } = require("../middleware/auth");
const express = require("express");
const Rating = require("../models/rating")
const router = express.Router();
const ratingSchema = require("../schemas/rating.json")
const { BadRequestError } = require("../expressError")

/** POST / {type, posterId, rating, review}
 * 
 * Rates a user/organization
 * 
 * Auth: login
 */

router.post("/", ensureLoggedIn, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, ratingSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const id = res.locals.user.id;
        const rating = {...req.body, reviewerId: id}
        const body = await Rating.rate(rating);
        
        return res.status(201).json(body);
    } catch (err) {
        return next(err);
    }
})

module.exports = router;