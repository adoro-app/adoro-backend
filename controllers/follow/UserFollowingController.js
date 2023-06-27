const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
// const moment = require('moment');
const moment = require('moment-timezone');

const multer = require('multer');
path = require('path');



exports.sendFollowRequest = async (req, res)=>{
    
        try{
            let user_id = req.body.user_id;
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            console.log(checkToken)
            if(checkToken.id){
                let addobj ={
                    user_id:user_id,
                    follower_user_id: checkToken.id,
                    status : 'pending',
                    created_on:currentDate

                }
                let addRecord = await common.AddRecords('follower', addobj )
                if(addRecord ){

                    let sqlForGetUserDeviceToken = `SELECT u.device_token, u.id, notification
                        FROM users u
                        WHERE u.id = ${user_id}
                        `
                       
                        let executeQ = await common.customQuery(sqlForGetUserDeviceToken)
                        console.log(executeQ)
                        let uid = (executeQ.data[0].id) ? executeQ.data[0].id : ''
                        let notification = (executeQ.data[0].notification) ? executeQ.data[0].notification : ''
                       
                        let device_token = (executeQ.data[0].device_token) ? executeQ.data[0].device_token : '';
                        let sqlForGetUserName = `SELECT u.username, u.full_name FROM users u WHERE 
                        id = ${checkToken.id}
                        `
                        let executeQu = await common.customQuery(sqlForGetUserName)
                        // console.log(executeQu)
                        let senderUsername = executeQu.data[0].username;
                        console.log(device_token)
                        console.log(notification)
                        console.log(device_token != '' && notification == 'true')
                        if(device_token != '' && notification == 'true'){
                            
                               const notification = {
                                  title: 'Follow Request',
                                  body: `${senderUsername} Sent you a follow request`,
                                }
                               
                                
                              const dataPayload = {
                                'data_id': checkToken.id,
                                'id': (Math.floor(100000 + Math.random() * 900000)).toString(),
                                'notification_type': 'FollowRequest'
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

                            let sendNotification = await common.sendNotification(message);
                            //confirm
                            
                                let addobject ={
                                    title:message.notification.title,
                                    message:message.notification.body,
                                    user_id : uid,
                                    data_id : checkToken.id,
                                    
                                    created_on: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
                
                                }
                                console.log(addobject)
                                let addRecord = await common.AddRecords('notification_history', addobject )
                               
                        
                            
                        }
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
    exports.acceptFollowRequest = async (req, res)=>{
    
        try{
            let id = req.body.requestId;
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            // console.log(checkToken)
            if(checkToken.id){
                let updateObj ={
                  status : 'accepted',
                }
                console.log(id)
                console.log(checkToken.id)
                let sql = `UPDATE follower SET status = 'accepted' WHERE follower_user_id = ${id} AND user_id = ${checkToken.id} ` 
                // let addRecord = await common.acceptFollowReq('follower', 'status = accepted', `follower_user_id = ${id} AND user_id = ${checkToken.id}` )
                let updateRec = await common.customQuery(sql);
                console.log(updateRec)
                if(updateRec ){
                    let sqlForGetUserDeviceToken = `SELECT u.device_token, u.id, u.notification
                    FROM users u 
                    WHERE u.id = ${id}
                    `
                   
                    let executeQ = await common.customQuery(sqlForGetUserDeviceToken)
                    let uid = (executeQ.data[0].id) ? executeQ.data[0].id : ''
                    let notification = (executeQ.data[0].notification) ? executeQ.data[0].notification : ''
                    let device_token = (executeQ.data[0].device_token) ? executeQ.data[0].device_token : '';
                    let sqlForGetUserName = `SELECT u.username, u.full_name FROM users u WHERE 
                    id = ${checkToken.id}
                    `
                    let executeQu = await common.customQuery(sqlForGetUserName)
                    let senderUsername = executeQu.data[0].username;
                    if(device_token != '' && notification == 'true'){
                      
                            const notification= {
                              title: 'Follow Request',
                              body: `${senderUsername} accepted your follow request`,
                            }
                           
                        
                          const dataPayload = {
                            'data_id': checkToken.id,
                            'id': (Math.floor(100000 + Math.random() * 900000)).toString(),
                            'notification_type': 'ConfirmRequest'
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

                        let sendNotification = await common.sendNotification(message);
                        
                        
                            let addobject ={
                                title:'Request Accepted',
                                message:message.notification.body,
                                user_id:uid,
                                data_id : checkToken.id,
                                created_on: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            
                            }
                            let addRecord = await common.acceptFollowReq('notification_history', addobject, `user_id = ${uid}` )
                            let deleteRecordsFromNH = await common.deleteRecords('notification_history',`user_id = '${checkToken.id}' AND data_id = '${uid}'`)
                    
                        
                    }
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
                res.send(response.UnauthorizedUser(checkToken))
            }
          
        }catch(err){
            throw err;
        }
    }

    exports.deleteFollowRequest = async (req, res)=>{
    
        try{
            
            let id = req.body.id;
            let flag = (req.body.flag) ? req.body.flag : ''; 
            
            let checkToken = await common.checkToken(req.headers);
            let datenow = new Date()
            let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
            // console.log(checkToken)
            if(checkToken.id){
                let deleteRecord;
                if (flag == 'feed'){
                     deleteRecord = await common.deleteRecords('follower', `user_id = ${id} AND follower_user_id = ${checkToken.id}` )
                }if(flag == 'delete'){
                     deleteRecord = await common.deleteRecords('follower', `user_id = ${checkToken.id} AND follower_user_id = ${id}` )
                     let deleteNotiHistory = await common.deleteRecords('notification_history',`user_id = ${checkToken.id} AND data_id = ${id}`)
                }else{
                    deleteRecord = await common.deleteRecords('follower', `user_id = ${id} AND follower_user_id = ${checkToken.id}` )
                }
                
                if(deleteRecord ){

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
                res.send(response.UnauthorizedUser(checkToken))
            }
          
        }catch(err){
            throw err;
        }
    }

    exports.getFollowerList = async (req, res)=>{
        try{
           let user_id = req.query.user_id
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                
                let sql = `SELECT users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
                follower.follower_user_id = users.id   WHERE follower.user_id = ${user_id} AND follower.status = 'accepted'`
                console.log(sql)
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

    exports.getFollowingList = async (req, res)=>{
        try{
            let user_id = req.query.user_id
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                
                let sql = `SELECT users.id, users.username, users.full_name, users.image, users.device_token, follower.status FROM follower LEFT JOIN users ON 
                follower.user_id = users.id WHERE follower.follower_user_id = ${user_id} AND follower.status = 'accepted'`
                // console.log(sql)
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
    exports.getpendingRequestList = async (req, res)=>{
        try{
           
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                console.log(checkToken)
                let sql = `SELECT follower.id as requestId ,users.id, users.username, users.full_name, users.image, follower.status FROM follower LEFT JOIN users ON 
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
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
                
        }catch(err){
            throw err;
        }
         
    }

    exports.checkUserFollowedByMe = async (req, res)=>{
        try{
            let user_id = req.query.user_id;
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                console.log(checkToken)
                let sql = `SELECT 
                CASE
                    WHEN EXISTS (
                        SELECT 1 
                        FROM follower
                        WHERE user_id = ${user_id} 
                        AND follower_user_id = ${checkToken.id}
                        AND status = 'accepted'
                    )
                    THEN 'true'
                    ELSE 'false'
                END AS follow_status;
            `
            
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