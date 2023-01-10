module.exports = {
    fetchRecordSuccessResponse: function (data) {
      var responseObj ={};
      responseObj.status = 1;
      responseObj.message = "Record found";
      responseObj.data = data;
      return responseObj;
    },
    loginSuccessResponse: function (data) {
      var responseObj ={};
      responseObj.status = 1;
      responseObj.message = "login Success";
      responseObj.data = data;
      return responseObj;
    },
    recordNotFoundResponse: function () {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Record not found";
        responseObj.data = [];
        return responseObj;
    },
    dbErrorResponse:function(error) {
        var responseObj ={};
        if(error != undefined)
          delete error.sql; 
        responseObj.status = 0;
        responseObj.Error = error;
        responseObj.message = "Something went wrong!";
        return responseObj;
    },
    recordAddedSuccessResponse: function (data) {
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = "Record inserted successfully";
        responseObj.data = data;
        return responseObj;
    },
    recordUpdatedSuccessResponse: function (data) {
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = "Record updated successfully";
        responseObj.data = data;
        return responseObj;
    },
    recordDeleteSuccessResponse: function (data) {
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = "Record deleted successfully";
        responseObj.data = data;
        return responseObj;
    },
    requiredParamsMissing:function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Required params missing";
        return responseObj;
    },
    UnauthorizedUser:function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Unauthorized User";
        return responseObj;
    },
    InvalidLoginDetails:function () {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Invalid username/password";
        return responseObj;
    },
    InvalidHeaderDetails:function () {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Invalid Headers Details";
        return responseObj;
    },
    LogoutResponse:function () {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Logout successfully";
        return responseObj;
    },
    AlreadyExists:function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = data+" Already Exists";
        return responseObj;
    },
    IdNotExists:function () {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = "Record Not Exists";
        return responseObj;
    },
    invalidDetails:function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = data;
        return responseObj;
    },
    successResponse: function (data) {
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = "Success";
        responseObj.data = data;
        return responseObj;
      },
    ApiErrorResponse: function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.Error = "API_ERROR";
        responseObj.message = "Error while API calling.";
        return responseObj;
    },
    IncorrectPassResponse: function (data) {
        var responseObj ={};
        responseObj.status = 4;
        responseObj.Error = "API_ERROR";
        responseObj.message = "Incorrect password.";
        return responseObj;
    },
    UsernameDoesNotExistResponse: function (data) {
        var responseObj ={};
        responseObj.status = 5;
        responseObj.Error = "API_ERROR";
        responseObj.message = "Username does not exist.";
        return responseObj;
    },
    successDynamicResponse: function (data) {
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = data.message;
        responseObj.data = data.data;
        return responseObj;
      },
      errorDynamicResponse: function (data) {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.Error = data.Error;
        responseObj.message = data.message;
        return responseObj;
    },
    validatorRrrors: function (data)
    {
        var responseObj ={};
        responseObj.status = 0;
        responseObj.message = data;
        return responseObj;
    },
    specialcharpresent: function (data) {
       
        var responseObj ={};
        responseObj.status = 1;
        responseObj.message = data['data']+" should be alphabets only";
        return responseObj;
    },
  }

   