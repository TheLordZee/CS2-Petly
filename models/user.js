"use strict";

const db = require("../db")
const bcrypt = require("bcrypt")
const { encrypt, decrypt } = require("../helpers/encrypt")
const { sqlForPartialUpdate } = require("../helpers/sql")
const { BadRequestError, NotFoundError, ExpressError, UnauthorizedError } = require("../expressError")

const { BCRYPT_WORK_FACTOR } = require("../config");
const Pet = require("./pet");

/** Related functions for users */

class User {
    /** authenticate user with username, password and decrypts phone number and address.
    *   
    *   Returns { username, firstName, lastName, username, address, email, phone, birthDay, profilePic}
    *
    * Throws UnauthorizedError is user not found or wrong password.
    **/
    static async authenticate(username, password){
        const res = await db.query(
            `SELECT id,
                first_name AS "firstName",
                last_name AS "lastName",
                password,
                username,
                address,
                email,
                phone,
                birth_day AS "birthDay",
                profile_pic AS "profilePic"
            FROM users
            WHERE username = $1`,
            [username]
        )

        const user = res.rows[0];
        if(!user) throw new UnauthorizedError("Invalid username");
          
        // compare hashed password to a new hash from password
        const isValid = await bcrypt.compare(password, user.password)
        if(isValid){
            delete user.password;
            user.phone = decrypt(user.phone);
            user.address = decrypt(user.address);
            return user;
        } else {
          throw new UnauthorizedError("Invalid password!")
        }
        
    }

    /** Register user with data. Encrypts phone number and address, if included
   *
   * Returns {  
   *    username,
   *    fullName, 
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic 
   * }
   *
   * Throws BadRequestError on duplicates.
   **/
    static async register(
        {firstName, lastName, password, username, address, email, phone, birthDay, profilePic}){
        const duplicateCheck = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
            [username]
        )

        if(duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
        const encryptedPhone = encrypt(phone);
        const encryptedAddres = encrypt(address)

        const res = await db.query(
            `INSERT INTO users
            (first_name, 
             last_name,
             password, 
             username, 
             address, 
             email, 
             phone, 
             birth_day, 
             profile_pic)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id,
                first_name AS "firstName", 
                last_name AS "lastName", 
                username, 
                address, 
                email, 
                phone, 
                birth_day AS "birthDay", 
                profile_pic AS "profilePic"`,
            [
                firstName, 
                lastName, 
                hashedPassword, 
                username, 
                encryptedAddres, 
                email, 
                encryptedPhone, 
                birthDay, 
                profilePic
            ]
        );

        const user = res.rows[0];
        user.phone = phone;
        user.address = address;
        return user;
    }

    /** Find all users.
   *
   * Returns [{  
   *    username,
   *    fullName, 
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic  
   * }, ...]
   **/

  static async findAll() {
    const res = await db.query(
          `SELECT id,
            first_name AS "firstName",
            last_name AS "lastName",
            username,
            address,
            email,
            phone,
            birth_day AS "birthDay",
            profile_pic AS "profilePic"
           FROM users
           ORDER BY username`
    );
    for(let user of res.rows){
      user.address = decrypt(user.address)
      user.phone = decrypt(user.phone)
    }
    return res.rows;
  }


   /** Given a username, return data about user.
   *
   * Returns { 
   *    username,
   *    fullName, 
   *    username,
   *    address,
   *    email, 
   *    phone,
   *    birthDay,
   *    profilePic,
   *    pets
   *  }
   *  
   *  Where pets is [{
   *    id, organizationId, userId,  url, type, species,  age, sex, size, coat, colors, name, description, photos, videos, status, uploaded
   * }, ...] 
   * 
   * Throws NotFoundError if user not found.
   **/

    static async get(username) {
        const userRes = await db.query(
              `SELECT id, 
                first_name AS "firstName",
                last_name AS "lastName",
                username,
                address,
                email,
                phone,
                birth_day AS "birthDay",
                profile_pic AS "profilePic"
               FROM users
               WHERE username = $1`,
            [username]
        );
    
        const user = userRes.rows[0];
    
        if (!user) throw new NotFoundError(`No user: ${username}`);
        const pets = await Pet.getPetsByUploader(user.id, "user")
        user.pets = pets;
        user.phone = decrypt(user.phone)
        user.address = decrypt(user.address)
        return user;
    }

     /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   {  
   *    username,
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
   * Returns { 
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
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    if(data.phone){
      data.phone = encrypt(data.phone)
    }
    if(data.address){
      data.address = encrypt(data.address)
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          birthDay: "birth_day",
          profilePic: "profile_pic"
        });
    const usernameVarIdx = "$" + (values.length + 1);
   
    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING id,
                      first_name AS "firstName", 
                        last_name AS "lastName", 
                        username, 
                        address, 
                        email, 
                        phone, 
                        birth_day AS "birthDay", 
                        profile_pic AS "profilePic"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    
    user.phone = decrypt(user.phone)
    user.address = decrypt(user.address)
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  static async checkExists(id){
    let res = await db.query(
      `SELECT id
      FROM users
      WHERE id = $1`,
      [id]
    )

    if(res.rows[0]) return true;
    return false;
  }
}

if(process.env.NODE_ENV !== "test"){
  setUp();
}

async function setUp(){
  const adminExists = await User.checkExists(1)
  if(!adminExists){
    User.register({
      firstName: "Admin", 
      lastName: "Admin", 
      password: "AdminPass1", 
      username: "Admin", 
      address: "Texas", 
      email: "a@c.com", 
      phone: "1111111111", 
      birthDay: "01/01/0001", 
      profilePic: ""
    })
  } else {
    console.log("Admin already exists")
  }
}

module.exports = User;