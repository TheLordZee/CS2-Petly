"use strict";
require("dotenv").config();
require("colors");
const crypto = require("crypto")

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const API_KEY = 'reTGGM2LZUojCOAYhvwnZvifwAFm7lrzdydrJuofn1OgjFntuX'
const API_SECRET = 'UnHPrP7h6VDPXuujpYbRGbGa1942ntSywnxHByZ6'

const PORT = +process.env.PORT || 3001;
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "petly-test-db"
        : process.env.DATABASE_URL || "petly-db";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

const algorithm = "aes-256-ctr";
const encryptionKey = "MpKtEsAr1A8RvYDbWBJE1vOxu5kt2Pgr"
const iv = crypto.randomBytes(16);

console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  algorithm,
  encryptionKey,
  iv
};