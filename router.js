'use strict'

const express = require('express');
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const jwt = require('jsonwebtoken');
const app = express();
const formidable = require('formidable')
const compression = require('compression');

const config = require('./config.js').setting[app.get('env')];

// Constants
const {
    PORT: PORT,
    HOST: HOST,
    HTTP: HTTP,
    CORS_DOMAIN: CORS_DOMAIN
} = config;

const lib = require('./lib.js');
const defaultUser = 'guest@zhaiduo.com';

const getEmail = email => {
    console.log("getEmail", lib.func.b64_to_utf8(email))
    return lib.func.b64_to_utf8(email)
};

const getCurrentUser = req => {
    return (req.cookies.email && getEmail(req.cookies.email).match(lib.commonReg.email)) ? getEmail(req.cookies.email) : defaultUser;
};

class Router {
    constructor(app) {
        const userLoginCheckArr = [{
            name: 'email',
            required: true,
            reg: new RegExp("^[0-9a-z_\\.\\-]+@[0-9a-z\\-]+\\.[0-9a-z\\.\\-]{2,}$", "i"),
            msg: '无效邮箱地址！'
        }, {
            name: 'password',
            required: true,
            reg: new RegExp("^[\\S]{6,}$", "i"),
            msg: '请输入至少6位密码！'
        }];

        const jwtIsValidCheckArr = [{
            name: 'email',
            required: true,
            reg: new RegExp("^[\\S]{6,}$", "i"),
            msg: '无效邮箱token！'
        }];

        const shouldCompress = (req, res) => {
            if (req.headers['x-no-compression']) {
                // don't compress responses with this request header
                return false
            }
            // fallback to standard filter function
            return compression.filter(req, res)
        }

        // gzip/deflate outgoing responses
        app.use(compression({
            filter: shouldCompress
        }))

        // Add headers
        app.use((req, res, next) => {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', CORS_DOMAIN)

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true)

            // Pass to next layer of middleware
            next()
        })

        //http://www.infoq.com/cn/articles/quit-scheme-of-node-uncaughtexception-emergence
        process.on('uncaughtException', function(err) {
            console.log('uncaughtException', err)
        })

        app.get('/', (req, res) => {
            res.send('Welcome~')
        })

        //JWT 注册新的token
        app.post('/login', (req, res) => {
            //console.log('Cookies: ', req.cookies)
            //console.log("/login", req);

            lib.postDataCheckAction(req, res, userLoginCheckArr, result => {
                //console.log("login", result)
                if (result.email) {
                    //console.log("findOne", user)
                    lib.jwtFunc.newToken({
                        email: result.email,
                        exp: lib.jwtFunc.genExp()
                    }, (err, token) => {
                        console.log("jwt", err, token)
                        if (err) {
                            lib.errRes(res, '创建token失败！');
                        } else {
                            lib.okRes(res, '创建token成功！', {}, lib.setCookie('email', token, 365));
                        }
                    })
                }
            });
        })

        //刷新token
        app.post('/jwt/refresh', (req, res) => {
            lib.postDataCheckAction(req, res, jwtIsValidCheckArr, result => {
                let token = result.email;
                var cert = fs.readFileSync('./db/id_rsa_img_pinbot_me_jwt.pem');
                jwt.verify(token, cert, {
                    algorithms: ['RS256']
                }, function(err, payload) {
                    console.log("=========verify", err, payload, lib.func.getTimestampMs())
                    let current_exp = lib.func.getTimestampMs();
                    if (payload) {
                        if (payload.exp <= current_exp) {
                            lib.errRes(res, 'token过期！' + lib.func.formatDate('yyyy-MM-dd hh-mm-ss', payload.exp) + ' ' + lib.func.formatDate('yyyy-MM-dd hh-mm-ss', current_exp));
                        } else {
                            lib.jwtFunc.newToken({
                                email: payload.email,
                                exp: lib.jwtFunc.genExp()
                            }, (err, token) => {
                                console.log("jwt", err, token)
                                if (err) {
                                    lib.errRes(res, '刷新token失败！');
                                } else {
                                    lib.okRes(res, '刷新token成功！', {}, lib.setCookie('email', token, 365));
                                }
                            })
                        }
                    } else {
                        lib.errRes(res, '无效token！');
                    }
                });

            });
        })

        //验证token
        app.post('/jwt/is_valid', (req, res) => {
            lib.postDataCheckAction(req, res, jwtIsValidCheckArr, result => {
                let token = result.email;
                lib.jwtFunc.verifyToken(token, (err, payload) => {
                    console.log("=========verify", err, payload)
                    if (payload) {
                        let current_exp = lib.func.getTimestampMs();
                        if (payload.exp <= current_exp) {
                            lib.errRes(res, 'token过期！' + lib.func.formatDate('yyyy-MM-dd hh-mm-ss', payload.exp) + ' ' + lib.func.formatDate('yyyy-MM-dd hh-mm-ss', current_exp));
                        } else {
                            lib.okRes(res, '验证成功[' + payload.email + ']！' + lib.func.formatDate('yyyy-MM-dd hh-mm-ss', payload.exp));
                        }
                    } else {
                        lib.errRes(res, '无效token！');
                    }
                })
            });
        })

    }

}

exports.Router = Router