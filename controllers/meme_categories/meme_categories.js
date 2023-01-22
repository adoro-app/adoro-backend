const { checkToken } = require('../../common/common');
const common  = require('../../common/common');
const config = require('../../config/config');

exports.memeCategories = async (req, res) => {
    
    try{
        
        let getMemeCategories = await common.GetRecords(config.memeCategoriesTable, '*', ``)
        if(getMemeCategories.data.length > 0){
            let response = {
            status : 200,
            msg : 'meme category found.',
            data : getMemeCategories.data
            }
            await res.send(response);
        
        }else{
            let response = {
            status : 500,
            msg : 'No meme category found.',
            data : getMemeCategories.data
            }
            await res.send(response);
        }
    
    }catch(err){
    await res.send(err);
    }
  }
  exports.userCategory = async (req, res) => {
    
    try{
        let token = req.headers;
        let category_id = (req.body.selected_category_ids) ? req.body.selected_category_ids : '';
        let checkTokenFromHeader = await common.checkToken(req.headers);
        
        if(checkTokenFromHeader.id && category_id.length > 0){
            
            for (let i = 0; i < category_id.length; i++ ){
                let addObj = {
                    user_id : checkTokenFromHeader.id,
                    category_id : category_id[i]

                }
                let insertRecord = await common.AddRecords(config.userMemeCategories, addObj);

            }
            let updateObj = {
                isCategorySelected : 'true'
            }
            let updateRecord = await common.UpdateRecords('users', updateObj, checkTokenFromHeader.id)
            
            let response = {
                status : 200,
                msg : "user categories added successfully"
            }
            res.send(response)
        }else{
            let response = {
                status : 500,
                msg : "Please select category id to add"
            }
            res.send(response)
        }
        
    
    }catch(err){
    await res.send(err);
    }
  }