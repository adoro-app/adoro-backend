const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
const moment = require('moment');

const multer = require('multer');
path = require('path');



exports.postComment = async (req, res)=>{
    
        try{
            let comment = req.body.comment;
            let parentId = req.body.parent_id;
            let postId = req.body.post_id;

            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            console.log(checkToken)
            if(checkToken.id){
                let addobj ={
                    comment:comment,
                    parent_id: parentId,
                    post_id:postId,
                    user_id:checkToken.id,
                    created_on:currentDate

                }
                let addRecord = await common.AddRecords('comments', addobj )
                if(addRecord ){

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
                res.send(response.UnauthorizedUser(checkToken))
            }
          
        }catch(err){
            throw err;
        }
    }
   
    exports.deleteComment = async (req, res)=>{
    
        try{
            let id = req.body.id;
            let checkToken = await common.checkToken(req.headers);
           
            if(checkToken.id){
                let addRecord = await common.deleteRecords('comments', `id = ${id}` )
                if(addRecord ){

                    let response = {
                        status : 200,
                        msg : 'comment Deleted'
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
                res.send(response.UnauthorizedUser(checkToken))
            }
          
        }catch(err){
            throw err;
        }
    }

    

exports.updateComment = async (req, res)=>{
    try{
        let id = req.body.id;
        let reqBody = req.body;
        
        let updateObj = {
          comment : (reqBody.comment) ? reqBody.comment : '', 
        }
        let checkToken = await common.checkToken(req.headers);
           
        if(checkToken.id){
            let updateRecords = await common.UpdateRecords('comments', updateObj, id)
            console.log(updateRecords.data.affectedRows > 0)
            if(updateRecords.data.affectedRows > 0 ){
              let response = {
                status : 200,
                msg : 'comment Updated'
              }
              await res.send(response);
            
            }else{
              let response = {
                status : 500,
                msg : 'Records Not updated.'
                
              }
              await res.send(response);
            }
        }
        
      }catch(err){
        await res.send(err);
      }
    }

    exports.getAllcomments = async (req, res)=>{
        try{
            let post_id = req.query.post_id;
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                
                let sql = `SELECT  users.username, users.full_name, users.image,comments.id as comment_id, comments.comment, comments.parent_id, comments.post_id, comments.created_on FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.post_id = ${post_id} AND comments.parent_id = 0;`
                // console.log(sql)
                let getUserComments = await common.customQuery(sql);
                if (getUserComments.data.length > 0){
                    
                    for (let i = 0; i < getUserComments.data.length; i++){
                        console.log(getUserComments.data[i].comment_id)
                        let sqlForFetchChileComment = `SELECT  users.username, users.full_name, users.image,comments.id as comment_id, comments.comment, comments.parent_id, comments.post_id, comments.created_on FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.parent_id = ${getUserComments.data[i].comment_id};`
                        let sqlForFetchChiledata = await common.customQuery(sqlForFetchChileComment);
                        console.log(sqlForFetchChiledata)
                        getUserComments.data[i]['reply_count'] = sqlForFetchChiledata.data.length;
                        getUserComments.data[i]['child_comment'] = sqlForFetchChiledata.data;
                    }
                    let response = {
                        status : 200,
                        msg : "Data Available",
                        commentCount : getUserComments.data.length,
                        data : getUserComments.data
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
            console.log(err)
            throw err;
        }
         
    }