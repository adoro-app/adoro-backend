const common  = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const moment = require('moment-timezone');

exports.userSignUp = async (req,res) =>
{
  try{
      let mobileNo = (req.body.mobileNo) ? req.body.mobileNo : "";
      let username = (req.body.username) ? req.body.username : ""
      let email = (req.body.email) ? req.body.email : ""
      let full_name = (req.body.full_name) ? req.body.full_name : ""
      let device_token = (req.body.device_token) ? req.body.device_token : ""
      let referred_by = (req.body.referred_by) ? req.body.referred_by : ""
      
      if (mobileNo != "" && mobileNo.length == 10 ){ 
        let GetRecords = await common.GetRecords(config.userTable, 'id', `mobileNo ='${mobileNo}'` )
        if(GetRecords.data.length > 0) {
          let response = {
            status : 500,
            msg : 'MobileNo Already Registered, Please login to countinue.'
          }
          res.send(response)
        }else{
          
          
            const currentDate = new Date();

            // Convert the date to a timestamp
            const timestamp = currentDate.getTime();
            const created_at = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            
            let generateOtp = Math.floor(100000 + Math.random() * 900000)
            let insertObj = {
              mobileNo : mobileNo,
              username : username,
              full_name: full_name,
              email : email,
              otp : generateOtp,
              device_token: device_token,
              refer_id: `${username}_${timestamp}`,
              created_on : created_at
            }
            if (referred_by != ''){
              let checkReferId = await common.GetRecords(config.userTable, 'id', `refer_id ='${referred_by}'` )
              if(checkReferId.data.length > 0){
                let addRecords = await common.AddRecords(config.userTable, insertObj )
                let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
                let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
                let sendMsg = await axios.get(url)
                //add cointowallet
                let addCoinToWallet = await common.addCoinToWallet('signup', checkReferId.data[0].id);
                let response = {
                  status : 200,
                  msg : 'OTP Sent Successfully'
                }
                res.send(response)
             
              }else{
                let response = {
                  status : 500,
                  msg : 'Incorrect Refer Id.'
                }
                res.send(response)
              }
            }else{
              let addRecords = await common.AddRecords(config.userTable, insertObj )
              let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
              let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
              let sendMsg = await axios.get(url)
              //add cointowallet
              let response = {
                status : 200,
                msg : 'OTP Sent Successfully'
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

exports.login = async (req,res) =>
{
  try{
      let mobileNo = (req.body.mobileNo) ? req.body.mobileNo : "";
      let device_token = (req.body.device_token) ? req.body.device_token : ""
      if (mobileNo != "" && mobileNo.length == 10){ 
        let generateOtp = Math.floor(100000 + Math.random() * 900000)
        
        let GetRecords = await common.GetRecords(config.userTable, 'id', `mobileNo =${mobileNo}` )
        console.log(GetRecords.data.length)
        if(GetRecords.data.length > 0){
          
          let message = `Hey Creator, Your OTP for signup is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`
          let url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`
          let sendMsg = await axios.get(url)
          let updateObj = {"otp" : generateOtp, "device_token" : device_token
        
        }
          let addOTP = await common.UpdateRecords(config.userTable, updateObj, GetRecords.data[0].id  )
          console.log(addOTP)
          let response = {
            status : 200,
            msg : 'OTP Sent Successfully'
          }
          res.send(response)
        }else{
          let response = {
            status : 500,
            msg : 'This Mobile Number does not exist. Please SignUp before Login '
          }
          res.send(response)

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

exports.validateOTP = async (req,res) =>
{
  try{
      let mobileNo = (req.body.mobileNo) ? req.body.mobileNo : "";
      let otp = (req.body.otp) ? req.body.otp : ""
      
      if (mobileNo != "" && mobileNo.length == 10){ 
       
        let GetRecords = await common.GetRecords(config.userTable, '*', `mobileNo =${mobileNo}` )
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
