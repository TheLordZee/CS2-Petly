"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) { 
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/**Middleware to use when they must be an Admin
 * 
 * If not, raises Unauthorized
 */
function ensureAdmin(req, res, next){
  try{
    if(!res.locals.user || res.locals.user.username !== "Admin") throw new UnauthorizedError();
    return next();
  }catch(e){
    return next(e);
  }
}

/**Middleware to use when they must be the user
 * 
 * If not, raises Unauthorized
 */
function isUser(req, res, next){
  try{
    if(!res.locals.user || res.locals.user.username !== req.params.username) throw new UnauthorizedError();
    return next();
  }catch(e){
    return next(e)
  }
}

/**Middleware to use when they must be the user or admin
 * 
 * If not, raises Unauthorized
 */
function isAdminOrUser(req, res, next){
  try{
    if (!res.locals.user) throw new UnauthorizedError();
    if(res.locals.user.username === req.params.username || res.locals.user.username === "Admin"){
      return next()
    }else{ 
      throw new UnauthorizedError();
    }
  }catch(e){
    return next(e)
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  isUser,
  isAdminOrUser
};
