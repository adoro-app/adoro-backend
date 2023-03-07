const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const AWS = require('aws-sdk'); 
const fs = require('fs');
const nodemailer = require("nodemailer");

const s3 = new AWS.S3({
  accessKeyId: config.AWS_CREDENTIAL.accessKeyId,
  secretAccessKey: config.AWS_CREDENTIAL.secretAccessKey
})
exports.agencySignUp = async (req,res) =>
{
  try{
      let first_name = (req.body.first_name) ? req.body.first_name : "";
      let last_name = (req.body.last_name) ? req.body.last_name : "";
      let company_name = (req.body.company_name) ? req.body.company_name : "";
      let mobileNo = (req.body.mobileNo) ? req.body.mobileNo : "";
      let password = (req.body.password) ? req.body.password : "";
      // let username = (req.body.username) ? req.body.username : ""
      let email = (req.body.email) ? req.body.email : ""
      let marketing_budget = (req.body.marketing_budget) ? req.body.marketing_budget : ""
      let meme_format = (req.body.meme_format) ? req.body.meme_format : ""
      let marketing_goals = (req.body.meme_format) ? req.body.meme_format : ""
      let campaign_name = (req.body.campaign_name) ? req.body.campaign_name : ""
      let campaign_industry = (req.body.campaign_industry) ? req.body.campaign_industry : ""
      let target_audience = (req.body.target_audience) ? req.body.target_audience : ""
      let IsLogo = (req.body.IsLogo) ? req.body.IsLogo : ""
      let IsStock_image = (req.body.IsStock_image) ? req.body.IsStock_image : ""
      let brand_guidlines = (req.body.brand_guidlines) ? req.body.brand_guidlines : ""
      
      if (email != ""  ){ 
        let GetRecords = await common.GetRecords('agency', 'id', `email = '${email}'` )
        if(GetRecords.data.length > 0) {
          let response = {
            status : 500,
            msg : 'Email Already Registered, Please login to countinue.'
          }
          res.send(response)
        }else{
         let datenow = new Date();
          let insertObj = {
                first_name : first_name,
                last_name : last_name,
                company_name : company_name,
                mobileNo : mobileNo,
                password : password,
            // let username = (req.body.username) ? req.body.username : ""
                email : email,
                marketing_budget : marketing_budget,
                meme_format : meme_format,
                marketing_goals : marketing_goals,
                campaign_name : campaign_name,
                campaign_industry : campaign_industry,
                target_audience : target_audience,
                IsLogo : IsLogo,
                IsStock_image : IsStock_image,
                brand_guidlines : brand_guidlines,
                created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')

          }
          let addRecords = await common.AddRecords('agency', insertObj );
          let GetNewAgency = await common.GetRecords('agency', 'first_name, last_name', `id = '${addRecords.data.insertId}'` )
          // console.log(addRecords.data.insertId)
          // let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          // let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          // let sendMsg = await axios.get(url)
          if(addRecords.data.affectedRows == 1){
            let response = {
              status : 200,
              msg : 'Sign up successfull, Please login to countinue.',
              userId : addRecords.data.insertId,
              name : `${GetNewAgency.data[0].first_name} ${GetNewAgency.data[0].last_name}`
            }
            res.send(response)
          }
          
        }
        
      }else{
        let response = {
          status : 500,
          msg : 'Please provide valid mobile number'
        }
        res.send(response)
      }
    } catch (error) {
     res.send(error);
  }
};

exports.agencyLogin = async (req,res) =>
{
  try{
      let email = (req.body.email) ? req.body.email : "";
      let password = (req.body.password) ? req.body.password : "";
      if (email != "" && password != ""){ 
        let GetRecords = await common.GetRecords('agency', 'id, first_name, last_name', `email = '${email}' && password = '${password}'` )
        
        if(GetRecords.data.length > 0){
          
          // let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          // let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          // let sendMsg = await axios.get(url)
          // let updateObj = {"otp" : generateOtp}
          // let addOTP = await common.UpdateRecords(config.userTable, updateObj, GetRecords.data[0].id  )
        //   let token =  jwt.sign({ id: GetRecords.data[0].id }, `'${config.JwtSupersecret}'`, {
        //     expiresIn: 864000 //parseInt(config.JwtTokenExpiresIn)
        // });
          let response = {
            status : 200,
            msg : 'Login Successfully',
            userId : GetRecords.data[0].id,
            name : `${GetRecords.data[0].first_name} ${GetRecords.data[0].last_name}`
          }
          res.send(response)
        }else{
          let response = {
            status : 500,
            msg : 'This email does not exist. Please SignUp before Login '
          }
          res.send(response)

        }
        
      }else{
        let response = {
          status : 500,
          msg : 'Please provide valid request param'
        }
        res.send(response)
      }
    } catch (error) {
     res.send(error);
  }
};

exports.validateOTP = async (req,res) =>
{
  try{
      let mobileNo = (req.body.mobileNo) ? req.body.mobileNo : "";
      let otp = (req.body.otp) ? req.body.otp : ""
      
      if (mobileNo != "" && mobileNo.length == 10){ 
       
        let GetRecords = await common.GetRecords('agency', '*', `mobileNo =${mobileNo}` )
        let token =  jwt.sign({ id: GetRecords.data[0].id }, `'${config.JwtSupersecret}'`, {
          expiresIn: 864000 //parseInt(config.JwtTokenExpiresIn)
      });
      
        if(GetRecords.data[0].otp == otp){
          let response = {
            status : 200,
            msg : 'Successful',
            token: token,
            data:GetRecords.data[0]

          }
          res.send(response)
        }else{
          let response = {
            status : 500,
            msg : 'Not Authorized'
          }
          res.send(response)
        }
        }
      } catch (error) {
     res.send(error);
  }
};

exports.getBlog = async (req,res) =>
{
  try{
    // let res;
    let GetRecords = await common.GetRecords('blog_case_study', '*', `status = 'active' AND category = 'blog'` )
    if(GetRecords.data.length > 0){
      let GetMostRecent = await common.customQuery(`SELECT * FROM blog_case_study where status = 'active' AND category = 'blog'   ORDER BY id DESC LIMIT 5 `)
      // console.log(GetMostRecent)
      let response = {
        status : 200,
        msg : 'Records Found',
        data:GetRecords.data,
        mostRecent : GetMostRecent.data



      }
      res.send(response)
    }else{
      let response = {
        status : 500,
        msg : 'Not Found'
      }
      res.send(response)
    }
        
    } catch (error) {
     res.send(error);
  }
};

exports.getCaseStudy = async (req,res) =>
{
  try{
        
    let GetRecords = await common.GetRecords('blog_case_study', '*', `status = 'active' AND category = 'caseStudy'` )
      if(GetRecords.data.length > 0){
        let response = {
          status : 200,
          msg : 'Records Found',
          data:GetRecords.data

        }
        res.send(response)
      }else{
        let response = {
          status : 500,
          msg : 'Not Found'
        }
        res.send(response)
      }
        
    } catch (error) {
     res.send(error);
  }
};

exports.contact_us = async (req,res) =>
{
  try{
    let reqBody = req.body;
    let datenow = new Date();
    let addObj = {
      full_name : reqBody.full_name,
      email: reqBody.email,
      mobileNo: reqBody.mobileNo,
      message: reqBody.message,
      created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')
    }
   
    let addRecord = await common.AddRecords('web_contact_us', addObj ) 
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
        
    } catch (error) {
     res.send(error);
  }
};
exports.dashboard = async (req,res) =>
{
  try{
    let resObj = {};
    let getcampaigncount = 'SELECT COUNT(*) AS campaign_count FROM campaign'
    let GetRecords = await common.customQuery(getcampaigncount)
    resObj['campaign_count'] = GetRecords.data[0].campaign_count
    console.log(GetRecords)
    let getpendingcampaign = `SELECT COUNT(*) AS pendingCampaign FROM campaign WHERE status = 'pending'`
    let getPendingcam = await common.customQuery(getpendingcampaign)
    console.log(getPendingcam)
    resObj['pending_campaign'] = getPendingcam.data[0].pendingCampaign
    console.log(resObj)
    // if(GetRecords.data.length > 0){
      let response = {
        status : 200,
        msg : 'Records Found',
        // data:GetRecords.data[0]
        data : resObj

      }
      res.send(response)
    // }else{
    //   let response = {
    //     status : 500,
    //     msg : 'Not Found'
    //   }
    //   res.send(response)
    // }
        
    } catch (error) {
     res.send(error);
  }
};
exports.createCampaign = async (req,res) =>
{
  // console.log(req)
  try{
    let reqBody = req.body;
    console.log(reqBody)
    let datenow = new Date();
    console.log(req.file)
    // if(req.file){
      // console.log('here')
      const filestream = fs.createReadStream(req.file.path)
      const params = {
          Bucket: config.aws_bucket_name_brand,
          Key: `${req.file.filename}.jpg`,
          Body: filestream
      }
      // console.log(params)
      s3.upload(params, async (err, data) => {
      if (err) {
        console.log(err)
          reject(err)
      }
      // console.log(data.Location);
      let addObj = {
        brand_name : reqBody.brand_name,
        campaign_name: reqBody.campaign_name,
        userId : reqBody.userId,
        logo: data.Location,
        time_limit: reqBody.time_limit,
        description : reqBody.description,
        no_of_meme_needed : reqBody.no_of_meme_needed,
        status : 'pending',
        created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')
      }
     
      let addRecord = await common.AddRecords('campaign', addObj ) 
      // console.log(addRecord.data.affectedRows)
      if(addRecord.data.affectedRows == 1){
        fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
          if (err) throw err;
          // if no error, file has been deleted successfully
          console.log('File deleted!');
      });
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
    // }
    // else{
    //   // console.log('=============')
    //   let response = {
    //     status : 500,
    //     msg : 'Please upload image to countinue.'
    //   }
    //   res.send(response)
    // }
    
    } catch (error) {
     res.send(error);
  }
};

exports.listCampaign = async (req,res) =>
{
  try{
    let userId = req.query.userId
    let GetRecords = await common.GetRecords('campaign', '*', `userId = ${userId}` )
      if(GetRecords.data.length > 0){
        let response = {
          status : 200,
          msg : 'Records Found',
          data:GetRecords.data

        }
        res.send(response)
      }else{
        let response = {
          status : 500,
          msg : 'Not Found'
        }
        res.send(response)
      }
        
    } catch (error) {
     res.send(error);
  }
};

exports.getCampaignById = async (req,res) =>
{
  try{
    let id  = req.query.id;
        
    let GetRecords = await common.GetRecords('campaign', '*', `id = ${id}`)
      if(GetRecords.data.length > 0){
        let response = {
          status : 200,
          msg : 'Records Found',
          data:GetRecords.data

        }
        res.send(response)
      }else{
        let response = {
          status : 500,
          msg : 'Not Found'
        }
        res.send(response)
      }
        
    } catch (error) {
     res.send(error);
  }
};
exports.userExist = async (req,res) =>
{
  try{
    let email = req.body.email;
    let GetRecords = await common.GetRecords('agency', '*', `email = '${email}'`  )
      if(GetRecords.data.length > 0){
        let response = {
          status : 500,
          msg : 'user already exist, Please login to countinue',
          // data:GetRecords.data

        }
        res.send(response)
      }else{
        let response = {
          status : 200,
          msg : 'User Not Found'
        }
        res.send(response)
      }
        
    } catch (error) {
     res.send(error);
  }
};
exports.getCampaignByStatus = async (req,res) =>
{
  try{
    let status = (req.query.status) ? req.query.status : '';
    let userId = req.query.userId;
    let GetRecords;
    if(status != '' ){
          GetRecords = await common.GetRecords('campaign', '*', `status = '${status}' AND userId = '${userId}'`  )
    }else{
          GetRecords = await common.GetRecords('campaign', '*', `userId = '${userId}'`  )
    }
    
      if(GetRecords.data.length > 0){
        let response = {
          status : 200,
          msg : 'Campaign Found',
          data:GetRecords.data

        }
        res.send(response)
      }else{
        let response = {
          status : 500,
          msg : 'Campaign Not Found'
        }
        res.send(response)
      }
        
    } catch (error) {
     res.send(error);
  }
};

exports.changePassword = async (req,res) =>
{
  // console.log(req)
  try{
    let reqBody = req.body;
    // console.log(reqBody)
    let datenow = new Date();
    let GetRecords = await common.GetRecords('agency', '*', `id = '${reqBody.userId}'` );
    let old_passord = GetRecords.data[0].password;
    if(old_passord == reqBody.old_pass){
      let updateObj = {
        password: reqBody.new_pass,
        }
      let updateRecord = await common.UpdateRecords('agency', updateObj, reqBody.userId ) 
      // console.log(updateRecord)
      if (updateRecord.data.affectedRows == 1){
        let response = {
          status : 200,
          msg : 'password updated successfully',
        }
        res.send(response)
      }else{
        let response = {
          status : 500,
          msg : 'Something went wrong',
        }
        res.send(response)
      }
      
    }else{
      let response = {
        status : 500,
        msg : 'Please provide correct password',
      }
      res.send(response)
    }
    } catch (error) {
     res.send(error);
  }
};

exports.forgetPassword = async (req,res) =>
{
  try{
    let email = (req.query.email) ? req.query.email : '';
    // let userId = req.query.userId;
    // let GetRecords;
    if(email != '' ){
          let GetRecords = await common.GetRecords('agency', '*', `email = '${email}'`  )
          console.log(GetRecords)
          if(GetRecords.data.length > 0){
           
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'campaign@marqueberry.com',
                pass: 'riduhxthwprnyilz'
              }
            });
            
            var mailOptions = {
              from: 'campaign@marqueberry.com',
              to: GetRecords.data[0].email,
              subject: 'Forget Password request',
              text: `Hi, Your passsword is ${GetRecords.data[0].password}`
            };
            
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                // console.log('Email sent: ' + info.response);
              let response = {
                status : 200,
                msg : 'Password sent to your registered email id',
                // data:GetRecords.data
    
              }
            res.send(response)
              }
            });
           

          }else{
            let response = {
              status : 500,
              msg : 'Please provide valid email',
              // data:GetRecords.data
      
            }
            res.send(response)
          }
    }else{
      let response = {
        status : 500,
        msg : 'Please provide valid email',
        // data:GetRecords.data

      }
      res.send(response)
          // GetRecords = await common.GetRecords('campaign', '*', `userId = '${userId}'`  )
    }
    
     
        
    } catch (error) {
     res.send(error);
  }
};