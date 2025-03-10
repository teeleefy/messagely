/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Missing data required. Cannot register user.", 400);
    }
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      'INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) RETURNING username, password, first_name, last_name, phone'
      , 
      [username, hashedPassword, first_name, last_name, phone]
    )
    const user = result.rows[0];
    return user;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    if (!username || !password) {
      throw new ExpressError("Missing data required. Cannot log-in user.", 400);
    }
    //Select user's password from db based on username
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]);
    let user = result.rows[0];
    if(!user){
      throw new ExpressError('Invalid username/password', 400);
    }
    let truePassword = user.password;
    if(await bcrypt.compare(password, truePassword)){
      return user;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users 
        SET last_login_at = current_timestamp 
        WHERE username = $1 
        RETURNING username`,
        [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`User by username "${username}" not found`, 404)
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT
        username, 
         first_name,  
         last_name, 
         phone 
        FROM users
        ORDER BY last_name, first_name`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const results = await db.query(
      `SELECT
        username, 
         first_name,  
         last_name, 
         phone,
         join_at,
         last_login_at 
        FROM users
        WHERE username = $1`, 
        [username]
    );
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone FROM messages AS m
      JOIN users AS u ON m.to_username = u.username
      WHERE m.from_username =$1`
      ,[username]);
      let msgArray = result.rows;
      let messages = msgArray.map(m =>  
         ({id: m.id,
          to_user: 
            {
              username: m.username,
              first_name: m.first_name,
              last_name: m.last_name,
              phone: m.phone
            },
          body: m.body,
          sent_at: m.sent_at,
          read_at: m.read_at}))
      return messages;
  }
  

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE m.to_username =$1`
      ,[username]);
      let msgArray = result.rows;
      let messages = msgArray.map(m =>  
         ({id: m.id,
          from_user: 
            {
              username: m.username,
              first_name: m.first_name,
              last_name: m.last_name,
              phone: m.phone
            },
          body: m.body,
          sent_at: m.sent_at,
          read_at: m.read_at}))
      return messages;;
  }
}


module.exports = User;