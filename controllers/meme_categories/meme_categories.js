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
            status : 200,
            msg : 'No meme category found.',
            data : getMemeCategories.data
            }
            await res.send(response);
        }
    
    }catch(err){
    await res.send(error);
    }
  }