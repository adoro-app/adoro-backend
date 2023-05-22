const common = require('../../common/common');
const config = require('../../config/config');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const response = require('../../constant/response');
const fs = require('fs');
// const moment = require('moment');
const moment = require('moment-timezone');
const AWS = require('aws-sdk');
const multer = require('multer');
path = require('path');

const s3 = new AWS.S3({
    accessKeyId: config.AWS_CREDENTIAL.accessKeyId,
    secretAccessKey: config.AWS_CREDENTIAL.secretAccessKey
})


exports.uploadTemplate = async (req, res) => {
    try {
        let tag = req.body.tag.toLowerCase();
        console.log(tag)
        let checkToken = await common.checkToken(req.headers);
        let datenow = new Date()
        let currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

        if (checkToken.id) {
            console.log(req.file)
            const filestream = fs.createReadStream(req.file.path)
            const params = {
                Bucket: (tag == 'standard') ? config.aws_bucket_name_template_standard : config.aws_bucket_name_template_licensed,
                Key: `${req.file.filename}.jpg`,
                Body: filestream
            }

            s3.upload(params, async (err, data) => {
                if (err) {
                    reject(err)
                }
                console.log(data.Location);
                let addobj = {
                    user_id: checkToken.id,
                    tag: tag,
                    caption:req.body.caption,
                    template_url: data.Location,
                    created_on: currentDate
                }

                let addObj = await common.AddRecords('templates', addobj)
                if (addObj) {
                    fs.unlink(path.join(__dirname, `../../uploads/${req.file.filename}`), function (err) {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                    let response = {
                        status: 200,
                        msg: "Data added successfully."
                    }
                    res.send(response)
                } else {
                    let response = {
                        status: 500,
                        msg: "Something went wrong"
                    }
                    res.send(response)
                }
            })
        } else {
            res.send(response.UnauthorizedUser(checkToken))
        }
    } catch (err) {
        throw err;
    }

}

exports.listTemplates = async (req, res) => {

    try {

        let checkToken = await common.checkToken(req.headers);
        if (checkToken.id) {
            let getuserdetails = await common.GetRecords('templates', '*', `status = 'approved' AND (tag = 'standard' OR tag = 'licensed')`)

            if (getuserdetails.data.length > 0) {

                let prepareRes = {
                    standard: [],
                    licensed: []
                }
                for (let i = 0; i < getuserdetails.data.length; i++) {

                    if (getuserdetails.data[i].tag == 'standard') {

                        prepareRes.standard.push(getuserdetails.data[i])
                    } else {
                        prepareRes.licensed.push(getuserdetails.data[i])
                    }
                }
                let response = {
                    status: 200,
                    msg: 'Data found.',
                    data: prepareRes

                }

                res.send(response)

            } else {
                let response = {
                    status: 500,
                    msg: 'No Data found.',


                }
                res.send(response)
            }

        } else {
            res.send(response.UnauthorizedUser(checkToken))
        }
    } catch (err) {
        await res.send(err);
    }
}

exports.getMyTemplates = async (req, res) => {

    try {

        let checkToken = await common.checkToken(req.headers);
        if (checkToken.id) {
            let getuserdetails = await common.GetRecords('templates', '*', `user_id = ${checkToken.id} AND status = 'approved' AND (tag = 'standard' OR tag = 'licensed')`)

            if (getuserdetails.data.length > 0) {

                let prepareRes = {
                    standard: [],
                    licensed: []
                }
                for (let i = 0; i < getuserdetails.data.length; i++) {

                    if (getuserdetails.data[i].tag == 'standard') {

                        prepareRes.standard.push(getuserdetails.data[i])
                    } else {
                        prepareRes.licensed.push(getuserdetails.data[i])
                    }
                }
                let response = {
                    status: 200,
                    msg: 'Data found.',
                    data: prepareRes

                }

                res.send(response)

            } else {
                let response = {
                    status: 500,
                    msg: 'No Data found.',


                }
                res.send(response)
            }

        } else {
            res.send(response.UnauthorizedUser(checkToken))
        }
    } catch (err) {
        await res.send(err);
    }
}

exports.getTrendingTemplates = async (req, res) => {

    try {

        let checkToken = await common.checkToken(req.headers);
        if (checkToken.id) {
            let getuserdetails = await common.GetRecords('templates', '*', `tag = 'trending'`)

            if (getuserdetails.data.length > 0) {
                let response = {
                    status: 200,
                    msg: 'Data found.',
                    data: getuserdetails.data

                }

                res.send(response)

            } else {
                let response = {
                    status: 500,
                    msg: 'No Data found.',


                }
                res.send(response)
            }

        } else {
            res.send(response.UnauthorizedUser(checkToken))
        }
    } catch (err) {
        await res.send(err);
    }
}