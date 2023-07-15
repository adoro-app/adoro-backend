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
		"HOST":"adoro-dev.csm3cnk9mdlu.ap-south-1.rds.amazonaws.com",
		"USER":"admin",
		"PASSWORD":"admin@123",
		"PORT" : 3306,
		"DATABASE":"adoro"
	},
	"aws_bucket_name_user"	 : 'adoro-new/userimage',
	"aws_bucket_name_post" : 'adoro-new/post',
	"aws_bucket_name_brand" : 'adoro-new/brand',
	"aws_bucket_name_campaign":'adoro-new/userAppliedcampaign',
	"aws_bucket_name_contest" : 'adoro-new/userAppliedContests',
	"aws_bucket_name_template_standard" : 'adoro-new/templates/standard',
	"aws_bucket_name_template_licensed" : 'adoro-new/templates/licensed',
	"RAZORPAY_SECRET":"",
	"RAZORPAY_KEY_ID":"",

	"AWS_CREDENTIAL"     :{
		"accessKeyId":"AKIA4EZQCBCZLYFKLJGU",
		"secretAccessKey":"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"
	},
	"api_key" : "euqraM9b0125947a366fb9e5",
	"templateID": "1707164905605342663",
	"PEID": "1701164723775936270",
	"JwtTokenExpiresIn"  : 86400, /* expires in 24 hours */
	"JwtSupersecret"     : 'supersecret',
	"firebase_token"	 : 'AAAA5kQXpAE:APA91bH9h1uhkrbzrbfogx28ioyCk2RV6UMdOh3AQJCb03KNTsLnRvFjrSsF-yEWXDY6IkPYd2rYyxLS9iJHUPW4rWsCQBeP-5Cac6NB_p_D0qBpH_MDehB7haJ4i7Oi9y7YBrn5nsRV'
	
}

