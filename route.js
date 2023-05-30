"use strict";


const router    = require('express').Router();
const config    = require('./config/config');
const signup    = require('./controllers/signup/signupController');
const User      = require('./controllers/users/userControllers');
const meme      = require('./controllers/meme_categories/meme_categories');
const follow    = require('./controllers/follow/UserFollowingController');
const post      = require('./controllers/post/feed')
const webAPI    = require('./controllers/wep-API/webApiControllers')
const multer    = require('multer');
const upload    = multer({dest : 'uploads/'});
const comment   = require('./controllers/comment/commentController')
const campaign  = require('./controllers/campaignAndcontest/campaignContestController')
const template  = require('./controllers/templates/templateControllers')
// const Razorpay  = require("razorpay");

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
router.post("/sendFollowRequest",  (req, res) => {
    follow.sendFollowRequest(req,res)
});
router.post("/acceptFollowRequest",  (req, res) => {
    follow.acceptFollowRequest(req,res)
});
router.post("/deleteFollowRequest",  (req, res) => {
    follow.deleteFollowRequest(req,res)
});
router.post("/deleteFollowRequest",  (req, res) => {
    follow.deleteFollowRequest(req,res)
});
router.get("/getFollowerList",  (req, res) => {
    follow.getFollowerList(req,res)
});
router.get("/getFollowingList",  (req, res) => {
    follow.getFollowingList(req,res)
});
router.get("/getpendingRequestList",  (req, res) => {
    follow.getpendingRequestList(req,res)
});
router.post('/agencySignup',upload.single('logo'),(req,res)=>{
    webAPI.agencySignUp(req,res)
});
router.route('/agencyLogin').post(webAPI.agencyLogin);
router.post("/agencyValidateOTP",  (req, res) => {
    webAPI.validateOTP(req,res)
});
router.get("/getBlog",  (req, res) => {
    webAPI.getBlog(req,res)
});
router.get("/getCaseStudy",  (req, res) => {
    webAPI.getCaseStudy(req,res)
});
router.post("/contact_us",  (req, res) => {
    webAPI.contact_us(req,res)
});
router.post("/createCampaign", upload.single('logo'), (req, res) => {
    // console.log(req.file)
    webAPI.createCampaign(req,res)
});
router.get("/listCampaign",  (req, res) => {
    webAPI.listCampaign(req,res)
});
router.get("/getCampaignById",  (req, res) => {
    webAPI.getCampaignById(req,res)
});
router.get("/dashboard",  (req, res) => {
    webAPI.dashboard(req,res)
});
router.post("/userExist",  (req, res) => {
    webAPI.userExist(req,res)
});
router.get("/getCampaignByStatus",  (req, res) => {
    webAPI.getCampaignByStatus(req,res)
});
router.post("/changePassword",  (req, res) => {
    webAPI.changePassword(req,res)
});
router.get("/forgetPassword",  (req, res) => {
    webAPI.forgetPassword(req,res)
});
// router.post("/postUserCategory",  (req, res) => {
//     post.postUserCategory(req,res)
// });

router.post("/postComment",  (req, res) => {
    comment.postComment(req,res)
});
router.post("/deleteComment",  (req, res) => {
    comment.deleteComment(req,res)
});
router.post("/updateComment",  (req, res) => {
    comment.updateComment(req,res)
});
router.get("/getAllcomments",  (req, res) => {
    comment.getAllcomments(req,res)
});

router.get("/getAllcampaignAndContestApp",  (req, res) => {
    campaign.getAllcampaignAndcontestApp(req,res)
});

// router.get("/applyCampaign",  (req, res) => {
//     campaign.applyCampaign(req,res)
// });
router.post("/applyCampaign", upload.single('media'), (req, res) => {
    // console.log(req.file)
    campaign.applyCampaign(req,res)
});
router.post("/applyContest", upload.single('media'), (req, res) => {
    // console.log(req.file)
    campaign.applyContest(req,res)
});

router.post("/uploadTemplate",  upload.single('template'), (req, res) => {
    template.uploadTemplate(req,res)
});

router.get("/listTemplates",  (req, res) => {
    template.listTemplates(req,res)
});
router.get("/getMyTemplates",  (req, res) => {
    template.getMyTemplates(req,res)
});
router.get("/getTrendingTemplates",  (req, res) => {
    template.getTrendingTemplates(req,res)
});

router.post("/reportPost", (req, res) => {
    post.reportPost(req,res)
});
router.get("/getProfileById",  (req, res) => {
    User.getProfileById(req,res)
});
router.get("/getPostById",  (req, res) => {
    User.getPostById(req,res)
});
router.post("/postLikesInComments",  (req, res) => {
    comment.postLikesInComments(req,res)
});
router.post("/deleteLikesInComments",  (req, res) => {
    comment.deleteLikesInComments(req,res)
});
router.post("/support",  (req, res) => {
    User.support(req,res)
});
router.get("/noteFromAdoro",  (req, res) => {
    User.noteFromAdoro(req,res)
});
router.get("/getNotification",  (req, res) => {
    User.getNotification(req,res)
});
router.get("/search",  (req, res) => {
    User.search(req,res)
});
router.get("/checkUserFollowedByMe",  (req, res) => {
    follow.checkUserFollowedByMe(req,res)
});
router.get("/getWalletBalance",  (req, res) => {
    User.getWalletBalance(req,res)
});
//payment

// router.post("/orders", async (req, res) => {
//     try {
//         console.log(req.body)
//         const instance = new Razorpay({
//             key_id: config.RAZORPAY_KEY_ID,
//             key_secret: config.RAZORPAY_SECRET,
//         });

//         const options = {
//             amount: 50000, // amount in smallest currency unit
//             currency: "INR",
//             receipt: "receipt_order_74394",
//         };

//         const order = await instance.orders.create(options);

//         if (!order) return res.status(500).send("Some error occured");

//         res.json(order);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

module.exports = router;
