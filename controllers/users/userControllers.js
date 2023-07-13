
const common = require('../../common/common');
const config = require('../../config/config');
const fs = require('fs');
// const moment = require('moment');
const moment = require('moment-timezone');
const AWS = require('aws-sdk'); 
// const multer = require('multer');
const path = require('path');
// const { get } = require('underscore');
const response = require('../../constant/response');
const { reject } = require('underscore');
const axios = require('axios')

const s3 = new AWS.S3({
    accessKeyId: config.AWS_CREDENTIAL.accessKeyId,
    secretAccessKey: config.AWS_CREDENTIAL.secretAccessKey
  })

exports.getUserDetails = async (req, res) => {
  console.log(req.query)
  try{
    let userId = req.query.userId;
    let getuserdetails = await common.GetRecords(config.userTable, '*', `id = ${userId}`)
    if(getuserdetails.data.length > 0){
      let response = {
        status : 200,
        msg : 'user found.',
        data : getuserdetails.data,
       }
      let getPost = await common.GetRecords('post', '*', `user_id = ${userId}`)
      response['post'] = getPost.data;
      let sql = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
      follower.follower_user_id = users.id WHERE follower.user_id = ${userId} AND follower.status = 'accepted'`
      let getFollower = await common.customQuery(sql);
      response['follower'] = getFollower.data;
      let sqlForFollowing = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
      follower.user_id = users.id WHERE follower.follower_user_id = ${userId} AND follower.status = 'accepted'`
      let getFollowingList = await common.customQuery(sqlForFollowing);
      response['following'] = getFollowingList.data;
      await res.send(response);
    
    }else{
      let response = {
        status : 500,
        msg : 'No user found.',
        data : getuserdetails.data
      }
      await res.send(response);
    }

  }catch(err){
    await res.send(err);
  }
}
exports.updateUserDetails = async (req, res) => {
  try{
    let userId = req.body.userId;
    let reqBody = req.body;
    
    let updateObj = {
      userName : (reqBody.userName) ? reqBody.userName : '', 
      full_name : (reqBody.full_name) ? reqBody.full_name : '',
      bankName : (reqBody.bankName) ? reqBody.bankName : '',
      beneficiaryName : (reqBody.beneficiaryName) ? reqBody.beneficiaryName : '', 
      accountNumber : (reqBody.accountNumber) ? reqBody.accountNumber : '',
      ifscCode : (reqBody.ifscCode) ? reqBody.ifscCode : ''
    }
    
    let updateRecords = await common.UpdateRecords(config.userTable, updateObj, userId)
    console.log(updateRecords.data.affectedRows > 0)
    if(updateRecords.data.affectedRows > 0 ){
      let response = {
        status : 200,
        msg : 'Records Updated',
        userId : userId
      }
      await res.send(response);
    
    }else{
      let response = {
        status : 500,
        msg : 'Records Not updated.',
        userId : userId
      }
      await res.send(response);
    }

  }catch(err){
    await res.send(err);
  }
}
exports.upload_profile_pic = async (req, res) => {
  try{
           
    let checkToken = await common.checkToken(req.headers);
    let datenow = new Date()
    let currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
   
    if(checkToken.id){
      console.log(req.file.fieldname)
        const filestream = fs.createReadStream(req.file.path)
        const params = {
            Bucket: config.aws_bucket_name_user,
            Key: `${req.file.filename}.jpg`,
            Body: filestream
        }
        
        s3.upload(params, async (err, data) => {
        if (err) {
            reject(err)
        }
        // console.log(data)
        let updateObj;
        if(req.file.fieldname == 'cover_photo'){
           updateObj = {
            cover_photo : data.Location
          }
        }else{
          updateObj = {
            image : data.Location
          }
        }
        
        let addObj = await common.UpdateRecords('users', updateObj, checkToken.id)
        
        if (addObj) {
            fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            });
            if(req.file.fieldname == 'cover_photo'){
              let response = {
                status : 200,
                msg : "cover photo updated successfully."
            }
            res.send(response)
           }else{
            let response = {
              status : 200,
              msg : "Profile picture updated successfully."
            }
            res.send(response)
           }
          
        }else{
            let response = {
                status : 500,
                msg : "Something went wrong"
            }
            res.send(response)
        }
        })
   }else{
    res.send(response.UnauthorizedUser(checkToken))
}
  }catch(err){
      throw err;
  }
}

exports.getProfileById = async (req, res) => {
  // console.log(req.query)
  try{
    let checkToken = await common.checkToken(req.headers);
    let userId, my_profile = false;
    my_profile = (checkToken.id == req.query.userId) ? true : false;
    userId = (req.query.userId) ? req.query.userId : '';
    let tag = ''
    
    if(checkToken.id){
      let getuserdetails = await common.GetRecords(config.userTable, '*', `id = ${userId}`)
    
      if(getuserdetails.data.length > 0){
        
        let sql = `SELECT
        u.id,
        u.username,
        u.full_name,
        u.image,
        u.device_token,
        u.refer_id,
        u.cover_photo,
        (
            SELECT COUNT(*)
            FROM follower f
            WHERE f.user_id = u.id AND f.status = 'accepted'
        ) AS followers_count,
        (
            SELECT COUNT(*)
            FROM follower fo
            WHERE fo.follower_user_id = u.id AND fo.status = 'accepted'
        ) AS following_count,
        COUNT(DISTINCT p.id) AS posts_count
    FROM
        users u 
    LEFT JOIN
        post p ON p.user_id = u.id 
    WHERE
        u.id = ${userId}
    GROUP BY
        u.id
        LIMIT 1`
                  console.log(sql)
        let getProfile = await common.customQuery(sql);
        // console.log('==',getProfile)
        getProfile['my_profile'] = my_profile;
        let sqlForPost = `SELECT p.id, p.content, p.content_type, p.content_url, p.created_on, 
        u.id AS user_id, u.username AS user_username, u.full_name AS user_full_name, u.image AS user_image, u.cover_photo AS user_cover_photo, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count, 
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count 
        FROM post p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.user_id = ${userId}
        GROUP BY p.id, u.id
        ORDER BY
    p.created_on DESC;
  `
        let getPostData = await common.customQuery(sqlForPost);
        getProfile.data[0]['posts'] = getPostData.data
        // console.log(getProfile)
        let sqlFormentionedPost = `SELECT p.id, p.content,p.content_type, p.content_url, p.created_on, u.username, u.image
        FROM post p
        JOIN post_tags pt ON p.id = pt.post_id
        JOIN users u ON pt.user_id = u.id
        WHERE pt.user_id = '${userId}'`

        let getmentioneData = await common.customQuery(sqlFormentionedPost);
        console.log(getmentioneData)
        getProfile.data[0]['mention'] = getmentioneData.data
        // if(my_profile == false){
        let sqlForFollowedByMe = `SELECT id FROM follower WHERE follower_user_id = ${checkToken.id} AND user_id = ${userId} AND status = 'accepted'`
        console.log(sqlForFollowedByMe)
        let FetchFollowedUser = await common.customQuery(sqlForFollowedByMe);
        let sqlForFollowedByHim = `SELECT id FROM follower WHERE follower_user_id = ${userId} AND user_id = ${checkToken.id} AND status = 'accepted'`
        let FetchFollowedHim = await common.customQuery(sqlForFollowedByHim);
        
        let sqlForPendingReq = `SELECT id FROM follower WHERE follower_user_id = ${userId} AND user_id = ${checkToken.id} AND status = 'pending'`
        let Fetchpendingreq= await common.customQuery(sqlForPendingReq);
       
        let sqlForPendingReqSentByMe = `SELECT id FROM follower WHERE follower_user_id = ${checkToken.id} AND user_id = ${userId} AND status = 'pending'`
        let FetchpendingreqsentByMe = await common.customQuery(sqlForPendingReqSentByMe);
  
        if(FetchFollowedUser.data.length > 0 && FetchFollowedHim.data.length > 0 && my_profile == false){
          getProfile.data[0]['tag'] = 'Following'
        }else if(FetchFollowedUser.data.length > 0 && FetchFollowedHim.data.length == 0 && my_profile == false){
          getProfile.data[0]['tag'] = 'Following'
        }else if(FetchFollowedUser.data.length == 0 && FetchFollowedHim.data.length > 0 && FetchpendingreqsentByMe.data.length == 0 && my_profile == false){
          getProfile.data[0]['tag'] = 'Follow Back'
        }else if(FetchFollowedUser.data.length == 0 && FetchFollowedHim.data.length == 0 && FetchpendingreqsentByMe.data.length == 0 && Fetchpendingreq.data.length == 0 && my_profile == false){
  
          getProfile.data[0]['tag'] = 'Follow'
        }else if(Fetchpendingreq.data.length > 0  && my_profile == false){
          getProfile.data[0]['tag'] = 'Confirm'
        }else if(my_profile == true){
          getProfile.data[0]['tag'] = 'Edit Profile'
        }else if(FetchpendingreqsentByMe.data.length > 0 && my_profile == false){
          getProfile.data[0]['tag'] = 'Requested'
        }else{
          getProfile.data[0]['tag'] = ''
        }
        // }
      //   console.log(getProfile.data[0]['tag'] )
      //   console.log(Fetchpendingreq.data.length)
      // let tag = getProfile.data[0]['tag']
      // console.log(FetchFollowedUser.data.length)
      // console.log(Fetchpendingreq.data.length)
       if(FetchFollowedUser.data.length > 0 && Fetchpendingreq.data.length > 0 ){
        getProfile.data[0]['sub_tag'] = 'Confirm'
       }else{
        getProfile.data[0]['sub_tag'] = ''
       }
        // console.log(getProfile)
        await res.send(getProfile);
      
      }else{
        let response = {
          status : 500,
          msg : 'No user found.',
         
        }
        await res.send(response);
      }
    }else{
      res.send(response.UnauthorizedUser(checkToken))
    }
    
    

  }catch(err){
    await res.send(err);
  }
}

exports.getPostById = async (req, res) => {
  // console.log(req.query)
  try{
    // let checkToken = await common.checkToken(req.headers);
    let post_id, my_profile = false;
    // my_profile = (checkToken.id == req.query.userId) ? true : false;
    post_id = (req.query.post_id) ? req.query.post_id : '';
    let tag = ''
    
    
    let getPostDetails = await common.GetRecords('post', '*', `id = ${post_id}`)
    if(getPostDetails.data.length > 0){
      
      let sql = `SELECT
      p.id,
      p.user_id,
      p.content,
      p.content_type,
      p.content_url,
      p.tag,
      p.created_on,
      users.username,
      users.full_name,
      users.image,
      COALESCE(l.likes_count, 0) AS noOfLikes,
      COALESCE(c.comments_count, 0) AS comments
    FROM
      post p
    LEFT JOIN
      users ON p.user_id = users.id
    LEFT JOIN
      (
        SELECT post_id, COUNT(*) AS likes_count
        FROM likes
        GROUP BY post_id
      ) l ON p.id = l.post_id
    LEFT JOIN
      (
        SELECT post_id, COUNT(*) AS comments_count
        FROM comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
    WHERE
      p.id = ${post_id};
    
      
      `
     
      let fetchpostdetails = await common.customQuery(sql);
      let PrepData = await preparedata(fetchpostdetails.data[0])
      let response = {
        status : 200,
        msg : 'post found.',
        data : PrepData
       
      }
      
      await res.send(response);
    
    }else{
      let response = {
        status : 500,
        msg : 'No post found.',
       
      }
      await res.send(response);
    }

  }catch(err){
    await res.send(err);
  }
}
async function preparedata(getdata){
  try{
    let sqlForFetchLikes = `SELECT post.id, users.id, users.username, users.full_name, users.image
    FROM post
    LEFT JOIN likes ON post.id = likes.post_id
    LEFT JOIN users ON likes.user_id = users.id
    WHERE post.id = ${getdata.id}
    AND likes.post_id IS NOT NULL
    `;
    // console.log(sqlForFetchLikes)
    let FetchLikes = await common.customQuery(sqlForFetchLikes);
    
    if(FetchLikes.data.length > 0){
      getdata['likedByPeople'] =  FetchLikes.data
    }else{
      getdata['likedByPeople'] =  []
    }
    console.log(JSON.stringify(getdata))
    return getdata;
  }catch(err){
throw err;
  }

      
 
}

exports.support = async (req,res) =>
{
  try{
      let full_name = (req.body.full_name) ? req.body.full_name : "";
      let email = (req.body.email) ? req.body.email : ""
      let message = (req.body.message) ? req.body.message : ""
      let checkToken = await common.checkToken(req.headers);

      
      if(checkToken.id){
        let insertObj = {
            full_name: full_name,
            email : email,
            message:message,
            user_id : checkToken.id,
            created_on : moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        }
          let addRecords = await common.AddRecords('support', insertObj )
          if(addRecords){
            let response = {
                status : 200,
                msg : 'query added successfully.'
              }
              res.send(response)
          
          }else{
            let response = {
                status : 200,
                msg : 'something went wrong.'
              }
              res.send(response)
          }
          
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
      
        
    
    } catch (error) {
     res.send(error);
  }
};

exports.noteFromAdoro = async (req, res) => {
  // console.log(req.query)
  try{
    let checkToken = await common.checkToken(req.headers);
      if(checkToken.id){
        let sql = `SELECT * FROM notefromadoro
        
        `
       
        let fetchpostdetails = await common.customQuery(sql);

        let response = {
          status : 200,
          msg : 'post found.',
          data : fetchpostdetails.data[0]
         
        }
        
        await res.send(response);
      
     
      
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
      

  }catch(err){
    await res.send(err);
  }
}

function groupByDataId(data) {
  const groupedData = {};
  
  data.forEach(item => {
    const { data_id } = item;
    
    if (groupedData[data_id]) {
      groupedData[data_id].push(item);
    } else {
      if (data_id) {
        groupedData[data_id] = [item];
      } else {
        groupedData[data_id] = [item];
      }
    }
  });

  // Convert the object into an array of arrays
  const result = Object.values(groupedData);

  return result;
}


// Controller function to get notifications
exports.getNotification = async (req, res) => {
  try {
    let response = {};
    let checkToken = await common.checkToken(req.headers);

    if (checkToken.id) {
      let sql = `SELECT nh.*, u.username, u.full_name, u.image
      FROM notification_history nh
      LEFT JOIN users u ON (nh.title = 'Follow Request' OR nh.title = 'Request Accepted') AND nh.data_id = u.id
      WHERE nh.user_id = '${checkToken.id}'
        AND nh.created_on >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
      ORDER BY nh.created_on DESC;
      `;

      let fetchPostDetails = await common.customQuery(sql);
      let resData = {
        status: 200,
        data: fetchPostDetails.data
      };

      await res.send(resData);
      // let sqlForAcceptRequest = `SELECT *
      //   FROM notification_history
      //   WHERE user_id = ${checkToken.id}
      //     AND created_on >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
      //     AND title = 'Request Accepted'
      //   ORDER BY created_on DESC`;

      // let fetchAcceptReqDetails = await common.customQuery(sqlForAcceptRequest);
      // response['accept_request'] = fetchAcceptReqDetails.data;

      // let sqlForComment = `SELECT *
      //   FROM notification_history
      //   WHERE user_id = ${checkToken.id}
      //     AND created_on >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
      //     AND title = 'Comment'
      //   ORDER BY created_on DESC`;

      // let fetchCommentDetails = await common.customQuery(sqlForComment);
      // response['comments'] = fetchCommentDetails.data;

      // let sqlForLike = `SELECT *
      //   FROM notification_history
      //   WHERE user_id = ${checkToken.id}
      //     AND created_on >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
      //     AND title = 'Like'
      //   ORDER BY created_on DESC`;

      // let fetchLikeDetails = await common.customQuery(sqlForLike);
      // response['likes'] = fetchLikeDetails.data;

      
    } else {
      res.send(response.UnauthorizedUser(checkToken));
    }
  } catch (err) {
    await res.send(err);
  }
};
exports.search = async (req, res) => {
  // console.log(req.query)
  try{
    let content = req.query.content;
    let checkToken = await common.checkToken(req.headers);
      if(checkToken.id){
        let sql = `SELECT * FROM users WHERE username LIKE '%${content}%' OR full_name LIKE '%${content}%';

        `
      //  console.log(sql)
        let fetchpostdetails = await common.customQuery(sql);
        // console.log(fetchpostdetails)
        if(fetchpostdetails.data.length > 0){
          let response = {
            status : 200,
            msg : 'users found.',
            data : fetchpostdetails.data
           
          }
          await res.send(response);
        }else{
          let response = {
            status : 500,
            msg : 'users Not found.'
           
          }
          await res.send(response);
        }
        
        
       
      
     
      
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
      

  }catch(err){
    await res.send(err);
  }
}
exports.getWalletBalance = async (req,res) =>
{
  try{
    let checkToken = await common.checkToken(req.headers);

      if (checkToken.id){ 
        let GetRecords = await common.GetRecords('wallet', 'id, user_id, balance', `user_id = '${checkToken.id}'` )
        let response = {
          status : 200,
          msg : 'data found.',
          data : GetRecords.data
         
        }
        await res.send(response);
        
        
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
    } catch (error) {
     res.send(error);
  }
};

exports.changeNotificationStatus = async (req,res) =>
{
  try{
    let checkToken = await common.checkToken(req.headers);

      if (checkToken.id){ 
        let GetRecords = await common.GetRecords('users', 'notification', `id = '${checkToken.id}'` )
        let updateObj;
        // console.log(GetRecords)
        if(GetRecords.data[0].notification == 'true'){
          updateObj ={
            notification : 'false'
          }
        }else{
          updateObj ={
            notification : 'true'
          }
        }
        let updateRec = await common.UpdateRecords('users',updateObj,checkToken.id)
         
        // console.log(updateRec.data.affectedRows)
        if(updateRec.data.affectedRows == 1){
           // console.log(updateRec)
          // if (updateRec.)
          let response = {
            status : 200,
            msg : 'Record Updated.',
           
           
          }
          await res.send(response);
          
          
        }
        
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
    } catch (error) {
     res.send(error);
  }
};

exports.getResult = async (req,res) =>
{
  try{
    let checkToken = await common.checkToken(req.headers);
    let tag = (req.query.tag) ? req.query.tag : '';


      if (checkToken.id && tag != ''){ 
        let GetRecords = await common.GetRecords('users', 'notification', `id = '${checkToken.id}'` )
        let updateObj;
        // console.log(GetRecords)
        if(GetRecords.data[0].notification == 'true'){
          updateObj ={
            notification : 'false'
          }
        }else{
          updateObj ={
            notification : 'true'
          }
        }
        let updateRec = await common.UpdateRecords('users',updateObj,checkToken.id)
         
        // console.log(updateRec.data.affectedRows)
        if(updateRec.data.affectedRows == 1){
           // console.log(updateRec)
          // if (updateRec.)
          let response = {
            status : 200,
            msg : 'Record Updated.',
           
           
          }
          await res.send(response);
          
          
        }
        
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
    } catch (error) {
     res.send(error);
  }
};


exports.send_withdrawal_otp = async (req,res) =>
{
  try{
    let checkToken = await common.checkToken(req.headers);
   

      if (checkToken.id){ 
        let GetRecords = await common.GetRecords('users', 'id, mobileNo', `id = '${checkToken.id}'` )
        let updateObj;
        console.log(GetRecords)
        if(GetRecords.data.length > 0){
          let mobileNo = GetRecords.data[0].mobileNo;
          let generateOtp = Math.floor(100000 + Math.random() * 900000)
        
          console.log(mobileNo)
          let message = `Hey Creator, Your OTP for Withdraw coin is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          console.log(url)
          let sendMsg = await axios.get(url)
          console.log(sendMsg)
          let updateObj = {"withdrawal_otp" : generateOtp}
        
        let updateRec = await common.UpdateRecords('users',updateObj,checkToken.id)
         
        // console.log(updateRec.data.affectedRows)
        if(updateRec.data.affectedRows == 1){
           // console.log(updateRec)
          // if (updateRec.)
          let response = {
            status : 200,
            msg : 'OTP Sent Successfully.',
           
           
          }
          await res.send(response);
          
          
        }
      }
        
      }else{
        res.send(response.UnauthorizedUser(checkToken))
      }
    } catch (error) {
     res.send(error);
  }
};

exports.validateWithdrawOTP = async (req, res) => {
  try {
    let otp = req.body.otp || "";
    let amount = parseFloat(req.body.amount) || 0;
    let checkToken = await common.checkToken(req.headers);

    if (checkToken.id) {
      let GetRecords = await common.GetRecords(config.userTable, '*', `id = ${checkToken.id}`);
      let GetWalletBalance = await common.GetRecords('wallet', '*', `user_id = ${checkToken.id}`);

      if (GetRecords.data[0].withdrawal_otp === otp) {
        let walletAmount = parseFloat(GetWalletBalance.data[0].balance);

        if (walletAmount >= amount) {
          if (amount === 0) {
            let response = {
              status: 500,
              msg: 'Please enter a valid amount.',
            };
            res.send(response);
          } else {
            let updatedBalance = walletAmount - amount;
            console.log(updatedBalance);

            let updateQ = `UPDATE wallet SET balance = '${updatedBalance}' WHERE user_id = ${checkToken.id};`;
            let updateRecords = await common.customQuery(updateQ);

            let insertObj = {
              user_id: checkToken.id,
              requested_amount: amount,
              created_at: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
            };
            let insertRecord = await common.AddRecords('withdrawal_request', insertObj);

            if (insertRecord) {
              let response = {
                status: 200,
                msg: 'Your request for withdrawal coin has been successfully submitted.',
              };
              res.send(response);
            }
          }
        } else {
          let response = {
            status: 500,
            msg: 'You do not have enough coin to withdraw.',
          };
          res.send(response);
        }
      } else {
        let response = {
          status: 500,
          msg: 'Incorrect OTP',
        };
        res.send(response);
      }
    } else {
      res.send(response.UnauthorizedUser(checkToken));
    }
  } catch (error) {
    res.send(error);
  }
};
