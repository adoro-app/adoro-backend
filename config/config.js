/* Comman config */
module.exports =
{
	"userTable"     	 : 'users',
	"memeCategoriesTable" : 'meme_categories',
	"userMemeCategories" :"user_meme_categories",
	"MYSQL_CREDENTIAL_DEVELOPMENT":{
		"HOST":"localhost",
		"USER":"root",
		"PASSWORD":"",
		"DATABASE":"adoro"
	},
	"MYSQL_CREDENTIAL_PRODUCTION":{
		"HOST":"adoro.csm3cnk9mdlu.ap-south-1.rds.amazonaws.com",
		"USER":"admin",
		"PASSWORD":"root12345",
		"PORT" : 3306,
		"DATABASE":"adoro"
	},
	"aws_bucket_name_user"	 : 'adoro/userimage',
	"aws_bucket_name_post" : 'adoro/post',
	"aws_bucket_name_brand" : 'adoro/brand',
	"AWS_CREDENTIAL"     :{
		"accessKeyId":"AKIA4EZQCBCZLYFKLJGU",
		"secretAccessKey":"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"
	},
	"api_key" : "euqraM9b0125947a366fb9e5",
	"templateID": "1707164905605342663",
	"PEID": "1701164723775936270",
	"JwtTokenExpiresIn"  : 86400, /* expires in 24 hours */
	"JwtSupersecret"     : 'supersecret'
	
}

