const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
// const moment = require('moment');
const moment = require('moment-timezone');
const AWS = require('aws-sdk'); 
const multer = require('multer');
path = require('path');





//   admin.messaging().send(message)
//   .then((response) => {
//     console.log('Notification sent successfully:', response);
//   })
//   .catch((error) => {
//     console.error('Error sending notification:', error);
//   });

const s3 = new AWS.S3({
    accessKeyId: config.AWS_CREDENTIAL.accessKeyId,
    secretAccessKey: config.AWS_CREDENTIAL.secretAccessKey
  })
exports.feed = async (req,res) =>
{
  try{
    let responseObj = {}
     let category = req.query.category;
     let pageNumber = req.query.pageNumber;
    //  console.log('token==', req.headers)
     let checkToken = await common.checkToken(req.headers);
    //  console.log(checkToken)
     if (checkToken.id)
     {
        let sqlQryForFeed = '';
        if (category == 'trending'){
             sqlQryForFeed = `SELECT p.id, p.user_id, p.content, p.content_type, p.content_url, p.created_on, users.username, users.full_name, users.image, COUNT(l.id) AS noOfLikes 
             FROM post p 
             LEFT JOIN likes l ON p.id = l.post_id
             LEFT JOIN users ON p.user_id = users.id
             LEFT JOIN user_report_post urp ON p.id = urp.post_id AND urp.user_id = ${checkToken.id}
             WHERE urp.id IS NULL AND l.id IS NOT NULL AND p.created_on >= DATE_SUB(NOW(), INTERVAL 60 DAY)
             GROUP BY p.id
             HAVING noOfLikes > 0
             ORDER BY noOfLikes DESC
             LIMIT 10
             
                   
              offset ${pageNumber * 10}`
        }else if(category == 'relevant'){
            sqlQryForFeed = `SELECT post.id, post.content, post.user_id, post.content_type, post.content_url, users.username, users.full_name, users.image , COUNT(l.id) AS noOfLikes
            FROM post 
            LEFT JOIN follower ON follower.user_id = post.user_id AND follower.status = 'accepted'
            LEFT JOIN users ON post.user_id = users.id
            LEFT JOIN likes l ON post.id = l.post_id
            LEFT JOIN user_report_post urp ON post.id = urp.post_id AND urp.user_id = ${checkToken.id}
            WHERE urp.id IS NULL AND follower.follower_user_id = ${checkToken.id}
            GROUP BY post.id
            ORDER BY post.created_on DESC
            LIMIT 10
            
             offset ${pageNumber * 10}`
        }else{
            let categoryIn = (category) ? category : '';
            let sqlforgetcategoryId = `SELECT * FROM post_categories WHERE title = '${categoryIn}'`
            let getcategoryId = await common.customQuery(sqlforgetcategoryId);
            let categoryId = getcategoryId.data[0].id;
            
            sqlQryForFeed = `SELECT p.id, p.user_id, p.content, p.content_type, p.content_url,  p.created_on,
            users.username, users.full_name, users.image, COUNT(DISTINCT l.id) AS noOfLikes
            FROM post p  
            LEFT JOIN users ON p.user_id = users.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN user_report_post urp ON p.id = urp.post_id AND urp.user_id = ${checkToken.id}
            WHERE urp.id IS NULL AND  p.category_id = ${categoryId}
            GROUP BY p.id
            ORDER BY p.created_on DESC
            LIMIT 10 offset ${pageNumber * 10}`
        }
        // console.log(sqlQryForFeed)
        let getData = await common.customQuery(sqlQryForFeed);
        console.log(getData.data.length);
        if (getData.data.length > 0){
                responseObj = getData.data;
                let result = [];
                for (let i = 0; i < responseObj.length; i++ ){
                    // console.log(responseObj[i])
                    let prepareRes = await fetchData(responseObj[i],checkToken.id);
                    result.push(prepareRes);
                }
                let resp = {
                    status : 200,
                    msg:'Data Found',
                    data : result
                }
                res.send(resp)
            }else{
               
            let resp = {
                status : 500,
                msg:'Not Found'
            }
            res.send(resp)
        }
     }else{
        res.send(response.UnauthorizedUser(checkToken))
     }
    } catch (error) {
        console.log(error)
     res.send(error);
  }
}

async function fetchData(res, uid){
    try{
        return new Promise(async (resolve, reject)=>{
            // console.log('ereeeeee')
            // console.log(res)
            let sqlForFetchLikes = `SELECT post.id, users.id, users.username, users.full_name, users.image FROM post LEFT JOIN likes ON post.id = likes.post_id LEFT JOIN users on likes.user_id = users.id WHERE post.id = ${res.id}`;
            // console.log(sqlForFetchLikes)
            let FetchLikes = await common.customQuery(sqlForFetchLikes);
            FetchLikes = (FetchLikes.data) ? FetchLikes.data : ''
        //    console.log('fetch like==>>',FetchLikes)
            if(FetchLikes.length > 0 && FetchLikes[0].id != null){
                // console.log('============',FetchLikes)
                res['likedByPeople'] = FetchLikes;
                res['likedByMe'] = false;
                for (let j = 0; j < FetchLikes.length; j++){
                    

                    if (uid == FetchLikes[j].id){
                        res['likedByMe'] = true;
                    }
        
                }
            }
            let sqlForGetAllCommentsCount = `SELECT COUNT(*) as total_comments FROM comments  WHERE post_id = ${res.id}`;
            let fetchCommentsCount = await common.customQuery(sqlForGetAllCommentsCount);
            // console.log('fetchcomment', fetchCommentsCount.data[0].total_comments)
            res['comments'] = fetchCommentsCount.data[0].total_comments;
            
            
            //    console.log('here')
            let sqlForFetchUsertag = `SELECT
            users.id,
            users.username,
            users.full_name
            FROM
            post_tags
            JOIN
            users ON post_tags.user_id = users.id
            WHERE
            post_tags.post_id = ${res.id}
            `;
            let FetchUsertag = await common.customQuery(sqlForFetchUsertag);
            res['tag_user'] = FetchUsertag.data
            
            let sqlForFollowedByMe = `SELECT id FROM follower WHERE follower_user_id = ${uid} AND user_id = ${res.user_id}`
            let FetchFollowedUser = await common.customQuery(sqlForFollowedByMe);
            if(FetchFollowedUser.data.length > 0){
                res['followedByMe'] = true
            }else{
                res['followedByMe'] = false
            }
           
            resolve(res)
        })

    }catch(err){
        console.log(err)
        throw err
    }
    
}

exports.like = async (req, res)=>{
    
        try{
            let post_id = req.body.post_id;
            let checkToken = await common.checkToken(req.headers);
           
            if(checkToken.id){
                let getrecord = await common.GetRecords('likes', 'id', `user_id = ${checkToken.id} AND post_id = ${post_id}`)
                // console.log(getrecord)
                // return false;
                if(getrecord.data.length == 0){
                    let addobj ={
                        user_id:checkToken.id,
                        post_id:post_id,
                        created_on: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    
                    }
                    let addRecord = await common.AddRecords('likes', addobj )
                    // console.log(addRecord)
                    if(addRecord ){
                        let sqlForGetUserDeviceToken = `SELECT users.id,
                        users.device_token
                    FROM
                        post
                    INNER JOIN
                        users ON post.user_id = users.id
                    WHERE
                        post.id = ${post_id};
                    
                        `
                       
                        let executeQ = await common.customQuery(sqlForGetUserDeviceToken)
                        let uid = (executeQ.data[0].id) ? executeQ.data[0].id : ''
                        let device_token = (executeQ.data[0].device_token) ? executeQ.data[0].device_token : '';
                    let sqlForGetUserName = `SELECT u.username, u.full_name FROM users u WHERE 
                        id = ${checkToken.id}
                        `
                        let executeQu = await common.customQuery(sqlForGetUserName)
                        let senderUsername = executeQu.data[0].username;
                        if(device_token != ''){
                           
                                const notification = {
                                  title: 'Like',
                                  body: `${senderUsername} liked your post.`
                                }
                            
                              const dataPayload = {
                                'data_id': post_id,
                                'id': (Math.floor(100000 + Math.random() * 900000)).toString(),
                                'notification_type': 'Like'
                              }
                             
                              const message = {
                                token: device_token, // Replace with the actual device token
                                notification: notification,
                                data: dataPayload
                              };
                              message.data = Object.entries(message.data).reduce((acc, [key, value]) => {
                                acc[key] = String(value);
                                return acc;
                              }, {});
                            if(checkToken.id != uid){
                                
                                let sendNotification = await common.sendNotification(message);
                                let addobject ={
                                    title:message.notification.title,
                                    message:message.notification.body,
                                    user_id : uid,
                                    
                                    created_on: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
                
                                }
                                let addRecord = await common.AddRecords('notification_history', addobject )
                            
                            }
                        }
                        let response = {
                            status : 200,
                            msg : 'Successfull'
                        }
                        
                        res.send(response)
                    }
                
                } else{
                    let response = {
                        status : 500,
                        msg : 'Already liked.'
                    }
                    res.send(response)
                }
                
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
            // let addRecords = common.AddRecords()

        }catch(err){
            throw err;
        }
       
        
    }

    exports.createPost = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            // console.log(req.file)
            let tag = JSON.parse(req.body.tag)
            
            // console.log(tag.length)
            // console.log(JSON.parse(req.body.tag.length))
            // return true;

            if(checkToken.id){
                // console.log(req.file)
                const filestream = fs.createReadStream(req.file.path)
                
                const fileExtension = req.file.originalname.split('.').pop();
                const params = {
                    Bucket: config.aws_bucket_name_post,
                    Key: `${uuidv4()}.${fileExtension}`,
                    Body: filestream
                }
                
                s3.upload(params, async (err, data) => {
                if (err) {
                    reject(err)
                }
                console.log(data.Location);
                let addobj = {
                    user_id : checkToken.id,
                    category_id : req.body.category_id,
                    content : req.body.content,
                    content_type : req.body.content_type,
                    content_url : data.Location,
                    tag : req.body.tag,
                    created_on : currentDate
                    
                }
                
                let addObj = await common.AddRecords('post', addobj )
                if (addObj) {
                    for (let i = 0; i < tag.length; i++){
                        let insertObj = {
                            user_id : tag[i],
                            post_id : addObj.data.insertId
                        }
                        await common.AddRecords('post_tags', insertObj )

                    }
                    fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                    let response = {
                        status : 200,
                        msg : "Data added successfully."
                    }
                    res.send(response)
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

    exports.deleteLike = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                let post_id = req.body.post_id;
                let deleteLike = await common.deleteRecords('likes', `user_id = ${checkToken.id} AND post_id = ${post_id}`);
                
                if (deleteLike){
                    let response = {
                        status : 200,
                        msg : "Like deleted successfully."
                    }
                    res.send(response)
                }else{
                    let response = {
                        status : 500,
                        msg : "Something went wrong"
                    }
                    res.send(response)
                }
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.getPostLikesUsers = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                let post_id = req.body.post_id;
                let sql = `SELECT users.id, users.username, users.full_name, users.image FROM likes LEFT JOIN users ON 
                likes.user_id = users.id WHERE likes.post_id = ${post_id}`
                let getUser = await common.customQuery(sql);
                if (getUser.data.length > 0){
                    let response = {
                        status : 200,
                        msg : "Data Available",
                        data : getUser.data
                    }
                    res.send(response)
                }else{
                    let response = {
                        status : 500,
                        msg : "No data available"
                    }
                    res.send(response)
                }
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.getAllPostByUser = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                let getUser = await common.GetRecords('post','id, content, content_type, content_url, created_on', `user_id = ${checkToken.id}`);
                if (getUser.data.length > 0){
                    let response = {
                        status : 200,
                        msg : "Data Available",
                        data : getUser.data
                    }
                    res.send(response)
                }else{
                    let response = {
                        status : 500,
                        msg : "No data available"
                    }
                    res.send(response)
                }
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.postUserCategory = async (req, res)=>{
    
        try{
            let selected_category = req.body.selected_categories;
            let checkToken = await common.checkToken(req.headers);
            console.log(checkToken)
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            console.log(selected_category.length)
            if(checkToken.id && selected_category.length > 0){
               
                for(let i =0; i < selected_category.length; i++){
                    let addobj = {
                        "user_id" : checkToken.id,
                        "category_id": selected_category[i]
                    }
                   await common.AddRecords('user_meme_categories', addobj )
                }
                let response = {
                    status : 200,
                    msg : 'Successfull'
                }
                        
                res.send(response)
                
                
              
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
            // let addRecords = common.AddRecords()

        }catch(err){
            throw err;
        }
       
        
    }
    exports.reportPost = async (req, res)=>{
    
        try{
            let postId = req.body.post_id;
            let checkToken = await common.checkToken(req.headers);
            console.log(checkToken)
            let datenow = new Date()
            let currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            let getUser = await common.GetRecords('user_report_post','id', `post_id = ${postId} AND user_id = ${checkToken.id}`);
              
            if(checkToken.id ){
               if(getUser.data.length == 0){
                let addobj = {
                    "user_id" : checkToken.id,
                    "post_id": postId,
                    "created_on": currentDate
                }
               let addRecords = await common.AddRecords('user_report_post', addobj )
                if(addRecords.data.affectedRows == 1){
                    let response = {
                        status : 200,
                        msg : 'Successfull'
                    }
                    res.send(response)
                }else{
                    let response = {
                        status : 500,
                        msg : 'Something went wrong'
                    }
                    res.send(response)
                }
               }else{
                let response = {
                    status : 500,
                    msg : 'Already reported.'
                }
                res.send(response)
               }
                    
                
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
           
        }catch(err){
            throw err;
        }
       
        
    }

  

    // const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

exports.createPostByChooseTemplate = async (req, res) => {
    try {
        let checkToken = await common.checkToken(req.headers);
        let currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        let tag = req.body.tag;

        if (typeof tag === 'string') {
            tag = JSON.parse(tag);
        }

        if (checkToken.id) {
            console.log(req.body.url)
            const fileExtension = req.body.url.split('.').pop();
            const imageResponse = await axios.get(req.body.url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
            const imageKey = `${uuidv4()}.${fileExtension}`;

            const uploadParams = {
                Bucket: config.aws_bucket_name_post,
                Key: imageKey,
                Body: imageBuffer,
            };

            let data = await s3.upload(uploadParams).promise();
            let addobj = {
                user_id: checkToken.id,
                category_id: req.body.category_id,
                content: req.body.content,
                content_type: req.body.content_type,
                content_url: data.Location,
               
                created_on: currentDate,
            };

            let addObj = await common.AddRecords('post', addobj);
            if (addObj) {
                for (let i = 0; i < tag.length; i++) {
                    let insertObj = {
                        user_id: tag[i],
                        post_id: addObj.data.insertId,
                    };
                    await common.AddRecords('post_tags', insertObj);
                }

                let response = {
                    status: 200,
                    msg: "Data added successfully.",
                };
                res.send(response);
            } else {
                let response = {
                    status: 500,
                    msg: "Something went wrong",
                };
                res.send(response);
            }
        } else {
            res.send(response.UnauthorizedUser(checkToken));
        }
    } catch (err) {
        throw err;
    }
};
