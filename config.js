/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const db = (process.env.NODE_ENV === "test")
  ? "messagely_test"
  : "messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  db,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};