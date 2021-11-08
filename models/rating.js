"use strict";

const db = require("../db")
const { BadRequestError, NotFoundError } = require("../expressError")
const User = require("./user")

class Rating{
    /** Rates a user/organization
   * 
   * Takes type, reviewerId, posterId, rating, review
   * 
   * Type must equal 'user' or 'organization'
   * Otherwise Throws BadRequestError
   * 
   * Returns: {type, reviewerId, posterId, rating, review}
   * 
   * Throws not found error if user doesn't exist.
   */

  static async rate({type, reviewerId, posterId, rating, review}){
    if(type !== 'user' && type !== 'organization') throw new BadRequestError(`Invalid type: ${type}`);

    const reviewerExists = await User.checkExists(reviewerId);
    if(!reviewerExists) throw new NotFoundError(`User with id: ${reviewerId} does not exist`)
    if(type === "user"){
        const posterExists = await User.checkExists(posterId)
        if(!posterExists) throw new NotFoundError(`User with id: ${reviewerId} does not exist`) 
    }

    const res = await db.query(
      `INSERT INTO ${type}_ratings (reviewer_id, poster_id, rating, review)
      VALUES ($1, $2, $3, $4)
      RETURNING reviewer_id AS "reviewerId", 
        poster_id AS "posterId", 
        rating, 
        review`,
      [reviewerId, posterId, rating, review]
    );

    return res.rows[0];
  }
}

module.exports = Rating;