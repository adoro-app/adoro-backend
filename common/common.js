"use strict";
const mysql = require('mysql');
const config = require('../config/config');
const responseCode = require('../constant/response');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const _SERVER = 'Production';



switch (_SERVER) {
    case "Production":
        var dbConnection = mysql.createConnection({
            host: config.MYSQL_CREDENTIAL_PRODUCTION.HOST,
            user: config.MYSQL_CREDENTIAL_PRODUCTION.USER,
            password: config.MYSQL_CREDENTIAL_PRODUCTION.PASSWORD,
            database: config.MYSQL_CREDENTIAL_PRODUCTION.DATABASE,
            dateStrings: true
        });
        break;
    case "Development":
        var dbConnection = mysql.createConnection({
            host: config.MYSQL_CREDENTIAL_DEVELOPMENT.HOST,
            user: config.MYSQL_CREDENTIAL_DEVELOPMENT.USER,
            password: config.MYSQL_CREDENTIAL_DEVELOPMENT.PASSWORD,
            database: config.MYSQL_CREDENTIAL_DEVELOPMENT.DATABASE,
            dateStrings: true

        });
        break;
    default:
        var dbConnection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "barcindia_sdk",
            dateStrings: true
        });
        break;
}


dbConnection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports =
    {
        
        GetRecords: async (table, fields, where = '') => {
            try {
                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    // if (_.isEmpty(fields)) {
                    //     fields = '*';
                    // }
                    // if (_.isEmpty(where)) {
                    //     where = 'id != ""';
                    // }
                    // if (!_.isEmpty(where)) {
                    //     where = 'id =' + where;
                    // }
                    let sql = `SELECT ${(fields)} FROM ${table} WHERE ${where}`;
                    
                    try {
                        dbConnection.query(sql, async (err, result) => {
                            if (err) {

                                reject(responseCode.dbErrorResponse(err));
                            }
                            if (result && result.length > 0) {
                                responseObj = responseCode.fetchRecordSuccessResponse(result);
                                resolve(responseObj);
                            } else {
                                responseObj = responseCode.recordNotFoundResponse();
                                resolve(responseObj)
                            }

                        })
                    } catch (error) {
                        return await error;
                    }
                });
            } catch (error) {
                return await error;
            }
        },
        GetAppConfRecords: async () => {
            try {

                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    let sql = `SELECT app.id as app_id, app.name, app.package_name, app.client_id, app.platform_id, config.id as config_id FROM bi_app as app, bi_config as config WHERE app.id=config.app_id`;
                    try {
                        dbConnection.query(sql, async (err, result) => {
                            if (err) {

                                reject(responseCode.dbErrorResponse(err));
                            }
                            if (result && result.length > 0) {
                                responseObj = responseCode.fetchRecordSuccessResponse(result);
                                resolve(responseObj);
                            } else {
                                responseObj = responseCode.recordNotFoundResponse();
                                resolve(responseObj)
                            }

                        })
                    } catch (error) {
                        return await error;
                    }
                });
            } catch (error) {
                return await error;
            }
        },
        AddRecords: async (table, addObject) => {

            try {
                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    let sql = `INSERT INTO ${table} SET ?`;
                    try {
                        dbConnection.query(sql, addObject, async (err, result) => {
                            if (err) {
                                console.log(err)
                                reject(responseCode.dbErrorResponse(err));
                            }
                            else (!_.isEmpty(result))
                            {
                                responseObj = await responseCode.recordAddedSuccessResponse(result);
                            }
                            // console.log(responseObj)
                            resolve(responseObj);
                        })
                    } catch (error) {

                        return await error;
                    }
                });
            } catch (error) {
                return await error;
            }
        },
        UpdateRecords: async (table, updateObject, id) => {

            try {

                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    let sql = `UPDATE ${table} SET ? Where id = ?`;
                    try {
                        dbConnection.query(sql, [updateObject, id], async (err, result) => {
                            if (err) {

                                reject(responseCode.dbErrorResponse(err));
                            }
                            else (!_.isEmpty(result))
                            {

                                responseObj = await responseCode.recordUpdatedSuccessResponse(result);
                            }
                            resolve(responseObj);
                        })
                    } catch (error) {
                        return await error;
                    }
                });
            } catch (error) {
                return await error;
            }
        },
        deleteRecords: async (table, where) => {
            try {
                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    let sql = `DELETE FROM ${table} WHERE ${where}`;
                    try {
                        dbConnection.query(sql, async (err, result) => {
                            if (err) {
                                reject(responseCode.dbErrorResponse(err));
                            }
                            else (!_.isEmpty(result))
                            {
                                responseObj = await responseCode.recordDeleteSuccessResponse(result);
                            }
                            resolve(responseObj);
                        })
                    } catch (error) {
                        return await error;
                    }
                });
            } catch (error) {
                return await error;
            }
        },
        Logins: async (where) => {
            try {
                return new Promise(async (resolve, reject) => {
                    let responseObj = {};
                    if (!_.isEmpty(where)) {
                        let sql = `SELECT id,username FROM ${config.UserTable} WHERE username = '${where.username}' and password = '${where.password}'`;
                        try {
                            dbConnection.query(sql, async (err, result) => {
                                if (err) { reject(err); }
                                if (!_.isEmpty(result)) {

                                    let uid = (_.isEmpty(result[0] && _.isEmpty(result[0].id)) ? result[0].id : '');
                                    let token = await jwt.sign({ id: uid }, `'${config.JwtSupersecret}'`, {
                                        expiresIn: 86400 //parseInt(config.JwtTokenExpiresIn)
                                    });
                                    result.push({ token: token });
                                    responseObj = await responseCode.loginSuccessResponse(result);
                                } else {
                                    responseObj = responseCode.InvalidLoginDetails();
                                }
                                resolve(responseObj);
                            })
                        } catch (error) {
                            return await error;
                        }
                    }
                });
            } catch (error) {
                return await error;
            }
        },
       
        checkToken: async (param) => {
            return new Promise(async (resolve, reject) => {
                jwt.verify(param.token, `'${config.JwtSupersecret}'`, async (err, decoded) => {

                    if (decoded && decoded.id == param.id) {
                        resolve(decoded);
                    }
                    else {
                        reject(responseCode.UnauthorizedUser(err));
                    }
                })
            })
        }
    }