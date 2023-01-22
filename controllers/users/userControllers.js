
const common = require('../../common/common');
const config = require('../../config/config');
const fs = require('fs');
const moment = require('moment');
const AWS = require('aws-sdk'); 
// const multer = require('multer');
const path = require('path');

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
        data : getuserdetails.data
      }
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
    let currentDate = moment(datenow).format('YYYY-MM-DD HH:mm:ss');
    
    if(checkToken){
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
   }
  }catch(err){
      throw err;
  }
}

