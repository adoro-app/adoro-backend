const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
const moment = require('moment');

const multer = require('multer');

path = require('path');

const AWS = require('aws-sdk'); 


const s3 = new AWS.S3({
  accessKeyId: config.AWS_CREDENTIAL.accessKeyId,
  secretAccessKey: config.AWS_CREDENTIAL.secretAccessKey
})



    exports.getAllcampaignAndcontestApp = async (req, res)=>{
        try{
          
            let checkToken = await common.checkToken(req.headers);
            
            if(checkToken.id){
                
                let sqlForFetchCampign = `SELECT * FROM campaign WHERE created_on >= ( CURDATE() - INTERVAL 2 DAY )`
                // console.log(sql)
                
                let getAllCampaign = await common.customQuery(sqlForFetchCampign);
                let sqlForFetchContest = `SELECT * FROM contests WHERE created_on >= ( CURDATE() - INTERVAL 2 DAY )`
                let getAllContests = await common.customQuery(sqlForFetchContest);
                if (getAllCampaign.data.length > 0 || getAllContests.data.length > 0){
                    for (let i = 0; i < getAllCampaign.data.length; i++){
                        let flag = "false";
                        
                        let checkAppliedCampaign = `SELECT * FROM user_applied_campaign WHERE user_id = '${checkToken.id}' AND campaign_id = '${getAllCampaign.data[i].id}' `
                        console.log(checkAppliedCampaign)
                        let getAppliedCampaign = await common.customQuery(checkAppliedCampaign);
                        console.log(getAppliedCampaign.data)
                        if(getAppliedCampaign.data.length > 0){
                            flag = "true"
                        }
                        getAllCampaign.data[i]['applied'] = flag
                    }
                    for (let j = 0; j < getAllContests.data.length; j++){
                        let flagForCon = "false";
                        let checkAppliedContest = `SELECT * FROM user_applied_contest WHERE user_id = '${checkToken.id}' AND contest_id = '${getAllCampaign.data[j].contest_id}' `
                        let getAppliedContest = await common.customQuery(checkAppliedContest);
                        if(getAppliedContest.data.length > 0){
                            flagForCon = "true"
                        }
                        getAllContests.data[j]['applied'] = flagForCon
                    }
                    let response = {
                        status : 200,
                        msg : "Data Available",
                        campaign : getAllCampaign.data,
                        contest : getAllContests.data

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

    exports.applyCampaign = async (req, res)=>{
        try{
            let reqBody = req.body;
            let datenow = new Date();
            let checkToken = await common.checkToken(req.headers);
            console.log(checkToken)
            if(checkToken.id){
                console.log(req.file.path)
                const filestream = fs.createReadStream(req.file.path)
                const params = {
                    Bucket: config.aws_bucket_name_campaign,
                    Key: req.file.originalname,
                    Body: filestream
                }
                // console.log(params)
                s3.upload(params, async (err, data) => {
                if (err) {
                  console.log(err)
                    reject(err)
                }
                console.log(data)
                fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
                  if (err) throw err;
                  // if no error, file has been deleted successfully
                  console.log('File deleted!');
              });
                // console.log(data.Location);
                let addObj = {
                  user_id : checkToken.id,
                  campaign_id : reqBody.campaign_id,
                  media: data.Location,
                  created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')
                }
               console.log(addObj)
                let addRecord = await common.AddRecords('user_applied_campaign', addObj ) 
                // console.log(addRecord.data.affectedRows)
                if(addRecord.data.affectedRows == 1){
                  
                    let response = {
                      status : 200,
                      msg : 'Successfull',
                    }
                    res.send(response)
                  }else{
                    let response = {
                      status : 500,
                      msg : 'Something went wrong'
                    }
                    res.send(response)
                  }
                })
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
             
            } catch (error) {
             res.send(error);
          }
         
    }
    exports.applyContest = async (req, res)=>{
        try{
            let reqBody = req.body;
            let datenow = new Date();
            let checkToken = await common.checkToken(req.headers);
            if(checkToken.id){
                const filestream = fs.createReadStream(req.file.path)
                const params = {
                    Bucket: config.aws_bucket_name_contest,
                    Key: req.file.originalname,
                    Body: filestream
                }
                // console.log(params)
                s3.upload(params, async (err, data) => {
                if (err) {
                  console.log(err)
                    reject(err)
                }
                fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
                  if (err) throw err;
                  // if no error, file has been deleted successfully
                  console.log('File deleted!');
              });
                // console.log(data.Location);
                let addObj = {
                  user_id : checkToken.id,
                  contest_id : reqBody.contest_id,
                  media: data.Location,
                  created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')
                }
               console.log(addObj)
                let addRecord = await common.AddRecords('user_applied_contest', addObj ) 
                // console.log(addRecord.data.affectedRows)
                if(addRecord.data.affectedRows == 1){
                  
                    let response = {
                      status : 200,
                      msg : 'Successfull',
                    }
                    res.send(response)
                  }else{
                    let response = {
                      status : 500,
                      msg : 'Something went wrong'
                    }
                    res.send(response)
                  }
                })
            }else{
                res.send(response.UnauthorizedUser(checkToken))
            }
             
            } catch (error) {
             res.send(error);
          }
         
    }
   