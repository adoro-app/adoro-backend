const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const AWS = require('aws-sdk'); 
const fs = require('fs');

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
      
      if (mobileNo != ""  ){ 
        let GetRecords = await common.GetRecords('agency', 'id', `mobileNo = '${mobileNo}' && email = '${email}'` )
        if(GetRecords.data.length > 0) {
          let response = {
            status : 500,
            msg : 'MobileNo Already Registered, Please login to countinue.'
          }
          res.send(response)
        }else{
         
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
                brand_guidlines : brand_guidlines

          }
          let addRecords = await common.AddRecords('agency', insertObj )
          // let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          // let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          // let sendMsg = await axios.get(url)
          if(addRecords.data.affectedRows == 1){
            let response = {
              status : 200,
              msg : 'Sign up successfull, Please login to countinue.'
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
        let GetRecords = await common.GetRecords('agency', 'id', `email = '${email}' && password = '${password}'` )
        
        if(GetRecords.data.length > 0){
          
          // let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          // let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          // let sendMsg = await axios.get(url)
          // let updateObj = {"otp" : generateOtp}
          // let addOTP = await common.UpdateRecords(config.userTable, updateObj, GetRecords.data[0].id  )
          let token =  jwt.sign({ id: GetRecords.data[0].id }, `'${config.JwtSupersecret}'`, {
            expiresIn: 864000 //parseInt(config.JwtTokenExpiresIn)
        });
          let response = {
            status : 200,
            msg : 'Login Successfully',
            token : token
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
        
    let GetRecords = await common.GetRecords('blog_case_study', '*', `status = 'active' AND category = 'blog'` )
    if(GetRecords.data.length > 0){
      let response = {
        status : 200,
        msg : 'Records Found',
        data:GetRecords.data[0]

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
          data:GetRecords.data[0]

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
  try{
    let reqBody = req.body;
    let datenow = new Date();
    // console.log(req.file.path)
    const filestream = fs.createReadStream(req.file.path)
    const params = {
        Bucket: config.aws_bucket_name_brand,
        Key: `${req.file.filename}.jpg`,
        Body: filestream
    }
    
    s3.upload(params, async (err, data) => {
    if (err) {
      // console.log(err)
        reject(err)
    }
    // console.log(data.Location);
    let addObj = {
      brand_name : reqBody.brand_name,
      campaign_name: reqBody.campaign_name,
      logo: data.Location,
      time_limit: reqBody.time_limit,
      description : reqBody.description,
      no_of_meme_needed : reqBody.no_of_meme_needed,
      status : 'pending',
      created_on : moment(datenow).format('YYYY-MM-DD HH:mm:ss')
    }
   
    let addRecord = await common.AddRecords('campaign', addObj ) 
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
    } catch (error) {
     res.send(error);
  }
};

exports.listCampaign = async (req,res) =>
{
  try{
        
    let GetRecords = await common.GetRecords('campaign', '*', '' )
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