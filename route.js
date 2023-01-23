"use strict";


const router    = require('express').Router();
const config    = require('./config/config');
const signup    = require('./controllers/signup/signupController');
const User      = require('./controllers/users/userControllers');
const meme      = require('./controllers/meme_categories/meme_categories');
const post      = require('./controllers/post/feed')
const multer    = require('multer');
const upload    = multer({dest : 'uploads/'});

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
router.get("/meme_categories",  (req, res) => {
    meme.memeCategories(req,res)
});
router.post("/user_category",  (req, res) => {
    meme.userCategory(req,res)
});
router.post("/upload_profile_pic", upload.single('profile_pic'), (req, res) => {
    User.upload_profile_pic(req,res)
});
router.post("/upload_cover_photo", upload.single('cover_photo'), (req, res) => {
    User.upload_profile_pic(req,res)
});
router.get("/feed",  (req, res) => {
    post.feed(req,res)
});
router.post("/like",  (req, res) => {
    post.like(req,res)
});

router.post("/createPost", upload.single('content_url'), (req, res) => {
    post.createPost(req,res)
});
router.post("/deleteLike",  (req, res) => {
    post.deleteLike(req,res)
});
router.post("/getPostLikesUsers",  (req, res) => {
    post.getPostLikesUsers(req,res)
});
router.get("/getAllPostByUser",  (req, res) => {
    post.getAllPostByUser(req,res)
});
module.exports = router;
