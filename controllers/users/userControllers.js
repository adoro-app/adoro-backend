
const common = require('../../common/common');
const config = require('../../config/config');




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
        status : 200,
        msg : 'No user found.',
        data : getuserdetails.data
      }
      await res.send(response);
    }

  }catch(err){
    await res.send(error);
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
        status : 200,
        msg : 'Records Not updated.',
        userId : userId
      }
      await res.send(response);
    }

  }catch(err){
    await res.send(error);
  }
}
