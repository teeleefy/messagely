
const express = require("express");

const User = require("../models/user");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const router = new express.Router();


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const authenticated = await User.authenticate(username, password);
    //could this updateLoginTimeStamp be incorporated into the User.authenticate method??
    if(authenticated){
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
  try {
      const {username} = await User.register(req.body);
      const token = jwt.sign({username}, SECRET_KEY);
      User.updateLoginTimestamp(username); 
      return res.json({token});
    } catch (err) {
      if (err.code === '23505') {
        return next(new ExpressError("Username taken. Please pick another!", 400));
      }
      return next(err);
  }
});

module.exports = router;