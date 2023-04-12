const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
const moment = require('moment');
const AWS = require('aws-sdk'); 
const multer = require('multer');
path = require('path');

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
     let checkToken = await common.checkToken(req.headers);
     console.log(checkToken)
     if (checkToken.id)
     {
        let sqlQryForFeed = '';
        if (category == 'trending'){
             sqlQryForFeed = `SELECT p.id, p.id, p.content, p.content_type, p.content_url, p.created_on, count(*) as noOfLikes 
             FROM likes l RIGHT JOIN post p ON l.post_id = p.id
             GROUP BY l.post_id 
             ORDER BY noOfLikes DESC limit 10 offset ${pageNumber * 10}`
        }else if(category == 'relevant'){
            sqlQryForFeed = `SELECT * FROM post left join users on users.id = post.user_id LEFT join follower on follower.user_id = post.user_id WHERE follower.follower_user_id = ${checkToken.id} ORDER BY post.created_on DESC limit 10 offset ${pageNumber * 10}`
        }else{
            let categoryIn = (category) ? category : '';
            let sqlforgetcategoryId = `SELECT * FROM post_categories WHERE title = '${categoryIn}'`
            let getcategoryId = await common.customQuery(sqlforgetcategoryId);
            let categoryId = getcategoryId.data[0].id;
            
            sqlQryForFeed = `SELECT * FROM post WHERE category_id = '${categoryId}' limit 10 offset ${pageNumber * 10}`
        }
        console.log(sqlQryForFeed)
        let getData = await common.customQuery(sqlQryForFeed);
        console.log(getData);
        if (getData.data.length > 0){
                responseObj = getData.data;
                let result = [];
                for (let i = 0; i < responseObj.length; i++ ){
                    let data = responseObj[i]
                    let prepareRes = await fetchData(data,checkToken.id);
                    result.push(prepareRes) ;
                }
                let resp = {
                    status : 200,
                    msg:'Data Found',
                    data : result
                }
                res.send(resp)
            }else{
            let res = {
                status : 500,
                msg:'Not Found'
            }
            res.send(res)
        }
     }
    } catch (error) {

     res.send(error);
  }
}

async function fetchData(res, uid){
    return new Promise(async (resolve, reject)=>{
        let sqlForFetchLikes = `SELECT users.id, users.username, users.full_name, users.image FROM post LEFT JOIN likes ON post.id = likes.post_id LEFT JOIN users on likes.user_id = users.id WHERE post.id = ${res.id}`;
        let FetchLikes = await common.customQuery(sqlForFetchLikes);
        FetchLikes = (FetchLikes.data) ? FetchLikes.data : ''
       
        if(FetchLikes[0].id != null){
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
        res['comments'] = fetchCommentsCount.data[0].total_comments;
        let sqlForFetchUserWhoLikesPost = `SELECT id, username, full_name, image  FROM users WHERE id = ${res.id}`;
        let FetchUser = await common.customQuery(sqlForFetchUserWhoLikesPost);
        res['author'] = FetchUser.data
        resolve(res)
    })
}

exports.like = async (req, res)=>{
    
        try{
            let post_id = req.body.post_id;
            let checkToken = await common.checkToken(req.headers);
            console.log(checkToken)
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            
            if(checkToken.id){
                let getrecord = await common.GetRecords('likes', 'id', `user_id = ${checkToken.id} AND post_id = ${post_id}`)
                console.log(getrecord)
                // return false;
                if(getrecord.data.length == 0){
                    let addobj ={
                        user_id:checkToken.id,
                        post_id:post_id,
                        created_on:currentDate
    
                    }
                    let addRecord = await common.AddRecords('likes', addobj )
                    // console.log(addRecord)
                    if(addRecord ){
    
                        let response = {
                            status : 200,
                            msg : 'Successfull'
                        }
                        
                        res.send(response)
                }
                
                } else{
                    let response = {
                        status : 500,
                        msg : 'Something went wrong.'
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
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            
            if(checkToken.id){
                console.log(req.file)
                const filestream = fs.createReadStream(req.file.path)
                const params = {
                    Bucket: config.aws_bucket_name_post,
                    Key: `${req.file.filename}.jpg`,
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
                    created_on : currentDate
                }
                
                let addObj = await common.AddRecords('post', addobj )
                if (addObj) {
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


  

