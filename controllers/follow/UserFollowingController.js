const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
const moment = require('moment');

const multer = require('multer');
path = require('path');



exports.sendFollowRequest = async (req, res)=>{
    
        try{
            let follower_user_id = req.body.user_id;
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            console.log(checkToken)
            if(checkToken){
                let addobj ={
                    user_id:checkToken.id,
                    follower_user_id: follower_user_id,
                    status : 'pending',
                    created_on:currentDate

                }
                let addRecord = await common.AddRecords('follower', addobj )
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
                let response = {
                    status : 500,
                    msg : 'UnAuthorized User, Please login to countinue'
                }
                res.send(response)
            }
          
        }catch(err){
            throw err;
        }
    }
    exports.acceptFollowRequest = async (req, res)=>{
    
        try{
            let id = req.body.id;
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            // console.log(checkToken)
            if(checkToken){
                let updateObj ={
                  status : 'accepted',
                }
                let addRecord = await common.UpdateRecords('follower', updateObj, id )
                if(addRecord ){

                    let response = {
                        status : 200,
                        msg : 'Request Accepted'
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
                    msg : 'UnAuthorized User, Please login to countinue'
                }
                res.send(response)
            }
          
        }catch(err){
            throw err;
        }
    }

    exports.deleteFollowRequest = async (req, res)=>{
    
        try{
            let id = req.body.id;
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            // console.log(checkToken)
            if(checkToken){
                let addRecord = await common.deleteRecords('follower', `id = ${id}` )
                if(addRecord ){

                    let response = {
                        status : 200,
                        msg : 'Request Deleted'
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
                    msg : 'UnAuthorized User, Please login to countinue'
                }
                res.send(response)
            }
          
        }catch(err){
            throw err;
        }
    }

    exports.getFollowerList = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
                
                let sql = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
                follower.user_id = users.id WHERE follower.user_id = ${checkToken.id} AND follower.status = 'accepted'`
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

    exports.getFollowingList = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
                
                let sql = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
                follower.user_id = users.id WHERE follower.follower_user_id = ${checkToken.id} AND follower.status = 'accepted'`
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
    exports.getpendingRequestList = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken){
                console.log(checkToken)
                let sql = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
                follower.follower_user_id = users.id WHERE follower.user_id = ${checkToken.id} AND follower.status = 'pending'`
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