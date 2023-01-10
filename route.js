"use strict";


const router    = require('express').Router();
const config    = require('./config/config');
const signup     = require('./controllers/signup/signupController');
const User       = require('./controllers/users/userControllers');

router.route('/signup').post(signup.userSignUp);
router.route('/login').post(signup.login);

// router.route('/updateUserDetails').patch(User.updateuserdetails);

router.get("/getUserDetails",  (req, res) => {
     User.getUserDetails(req,res)
});
router.post("/updateUserDetails",  (req, res) => {
    User.updateUserDetails(req,res)
});
router.post("/validateOTP",  (req, res) => {
    signup.validateOTP(req,res)
});
  
module.exports = router;
