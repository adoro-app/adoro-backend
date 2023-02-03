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
     let checkToken = await common.checkToken(req.headers);
     if (checkToken)
     {
        let sqlQryForFeed = '';
        if (category == 'trending'){
             sqlQryForFeed = `SELECT l.post_id, p.id, p.content, p.content_type, p.content_url, p.created_on, count(*) as noOfLikes 
             FROM likes l LEFT JOIN post p ON l.post_id = p.id
             GROUP BY l.post_id 
             ORDER BY noOfLikes DESC`
        }else{
            sqlQryForFeed = ''
        }
       
        let getData = await common.customQuery(sqlQryForFeed);
    
        if (getData.data.length > 0){
                responseObj = getData.data;
                let result = [];
                for (let i = 0; i < responseObj.length; i++ ){
                    let data = responseObj[i]
                    let prepareRes = await fetchData(data,checkToken.id);
                    result.push(prepareRes) ;
                }
                res.send(result)
            }else{
            let res = {
                status : 500,
                msg:'please select correct category'
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
        res['likedByPeople'] = FetchLikes;
        res['likedByMe'] = false;
        for (let j = 0; j < FetchLikes.length; j++){
            
            if (uid == FetchLikes[j].id){
                res['likedByMe'] = true;
            }

        }
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
            
            if(checkToken){
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
            
            if(checkToken){
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
           }
        }catch(err){
            throw err;
        }
         
    }

    exports.deleteLike = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
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
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.getPostLikesUsers = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
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
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.getAllPostByUser = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
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
            }
                
        }catch(err){
            throw err;
        }
         
    }


  

