'use strict'

const express = require('express');
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const jwt = require('express-jwt');
const app = express();
const formidable = require('formidable')
const config = require('./config.js').setting[app.get('env')];

// Constants
const {
    PORT: PORT,
    HOST: HOST,
    HTTP: HTTP,
    UPLOAD_URL: UPLOAD_URL,
    UPLOAD_DIR: UPLOAD_DIR,
    CORS_DOMAIN: CORS_DOMAIN,
    IMG_PREFIX: IMG_PREFIX,
    SQL_DIR: SQL_DIR
} = config;

const db = require('./db.js')
const Img = db.Img
const User = db.User
const Tag = db.Tag
const ImgTags = db.ImgTags

const tmpl = require('./tmpl.js');
const lib = require('./lib.js');
const eachPage = 1

class Controller {
    constructor() {

    }
    static pageList(res, tbIns, tmplCb, {
        cp = 1,
        where = {},
        offset = 0,
        eachPage = 10,
        order = [
            ['id', 'DESC']
        ],
        more = {}
    } = {}) {
        tbIns.findAndCountAll({
            where: where,
            offset: offset,
            limit: eachPage,
            order: order
        }).then(result => {
            //console.log('result.count', result.count);
            //console.log('result.rows', result.rows);
            let reloadScriptHtml = (app.get('env') === 'development') ? '<script src="/reload/reload.js"></script>' : ''
            res.send(tmplCb(result.count, cp, eachPage, result.rows, more) + reloadScriptHtml)
        })
    }
}

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
        app.use('/' + UPLOAD_DIR, express.static(UPLOAD_DIR))
        app.use('/static', express.static('static'))

        //http://www.infoq.com/cn/articles/quit-scheme-of-node-uncaughtexception-emergence
        process.on('uncaughtException', function(err) {
            console.log('uncaughtException', err)
        })

        const jwtTokenSecret = 'hello world !'

        /*app.use(jwt({
            secret: jwtTokenSecret,
            credentialsRequired: false
        }))

        app.use(function(err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                res.status(401).send('invalid token...')
            }
        })

        app.use(jwt({
            secret: jwtTokenSecret
        }).unless({
            path: ['/token']
        }));*/

        app.get('/',
            /*jwt({
                secret: jwtTokenSecret
            }),*/
            (req, res) => {
                //console.log("req.user", req.user)
                //console.log('Cookies: ', req.cookies);
                //if (!req.user.admin) return res.sendStatus(401)
                Controller.pageList(res, Img, tmpl.indexTmpl, {
                    cp: 1,
                    where: {},
                    offset: 0,
                    eachPage: eachPage,
                    order: [
                        ['id', 'DESC']
                    ],
                    more: {
                        link: CORS_DOMAIN
                    }
                });
            })

        app.get('/:page', (req, res) => {

            //console.log('Cookies: ', req.cookies);
            let cp = 1
            if (typeof req.params.page === 'string' && req.params.page.match(/^[0-9]+$/i)) cp = req.params.page
            let offset = eachPage * (parseInt(cp, 10) - 1)
            Controller.pageList(res, Img, tmpl.indexTmpl, {
                cp: cp,
                where: {},
                offset: offset,
                eachPage: eachPage,
                order: [
                    ['id', 'DESC']
                ],
                more: {
                    link: CORS_DOMAIN
                }
            });
        })

        app.post('/' + UPLOAD_URL, (req, res) => {
            let imgName, userId, userName, userEmail;
            // create an incoming form object
            let form = new formidable.IncomingForm()
            let emailPattern = new RegExp("^([0-9a-z_\\.\\-]+)@[0-9a-z\\-]+\\.[0-9a-z\\.\\-]+$", "i")

            // specify that we want to allow the user to upload multiple files in a single request
            form.multiples = true

            // store all uploads in the /uploads directory
            form.uploadDir = path.join(__dirname, '/' + UPLOAD_DIR + '/' + lib.getDayDir())
            console.log('form.uploadDir', form.uploadDir)

            let promise = new Promise((resolve, reject) => {
                mkdirp(form.uploadDir, (err) => {
                    if (err) {
                        console.error('mkdirp', err)
                        reject(err)
                    } else {
                        resolve(form.uploadDir);
                    }
                })
            })

            promise.then(result => {
                console.log('promise ok', result)

                let subPromise = new Promise((resolve, reject) => {
                    // every time a file has been uploaded successfully,
                    // rename it to it's orignal name
                    form.on('file', (name, file) => {
                        if (name === 'file' && file.type && file.type.match(/^image\/(png|jpg|jpeg|gif)$/i)) {
                            imgName = `${IMG_PREFIX}${new Date().getTime()}` + '.png'
                            fs.rename(file.path, path.join(form.uploadDir, imgName))
                            console.log('file', name, imgName);
                        }
                    })

                    // log any errors that occur
                    form.on('error', err => {
                        console.log('An error has occured: \n' + err)
                    })

                    // once all the files have been uploaded, send a response to the client
                    form.on('end', () => {
                        //console.log("end", 1);
                    })

                    // parse the incoming request containing the form data
                    // https://github.com/felixge/node-formidable
                    form.parse(req, (err, fields, files) => {
                        console.log("fields", fields);
                        if (fields && fields.email) {
                            if (fields.email.match(emailPattern)) {
                                userName = RegExp.$1
                                //判断用户是否存在
                                User.findOrCreate({
                                    where: {
                                        email: fields.email
                                    },
                                    defaults: {
                                        name: userName
                                    }
                                }).then(user => {
                                    //console.log("user", user)
                                    if (user[0] && user[0].dataValues) {
                                        userId = user[0].dataValues.id
                                        userEmail = user[0].dataValues.email
                                    } else {
                                        userId = 1
                                        userEmail = fields.email
                                    }
                                    resolve(fields.email)
                                }).catch(error => {
                                    reject({
                                        status: 'error',
                                        msg: 'user check error'
                                    })
                                })
                            } else {
                                reject({
                                    status: 'error',
                                    msg: 'invalid email'
                                })
                            }
                        } else {
                            reject({
                                status: 'error',
                                msg: 'email not found'
                            })
                        }
                    })
                })

                subPromise.then(result => {
                    //console.log('promise fields ok', result, imgName, userEmail)
                    let url = lib.imgUrlPrefix(UPLOAD_DIR) + imgName
                    Img.create({
                        name: imgName,
                        email: userEmail,
                        category: lib.getDayDir(),
                        url: url,
                        userId: userId
                    }).then(img => {
                        console.log('insert img', img.get('name'))

                        //测试tag
                        /*Tag.findOrCreate({
                            where: {
                                name: '截图'
                            },
                            defaults: {}
                        }).then(tag => {
                            //console.log("user", user)
                            let tagId = 1
                            if (tag[0] && tag[0].dataValues) {
                                tagId = tag[0].dataValues.id
                            }
                            //img.addTag(tag, {})
                            console.log('insert tag', tagId, img.get('id'))
                            ImgTags.findOrCreate({
                                where: {
                                    tagId: tagId,
                                    imgId: img.get('id')
                                },
                                defaults: {}
                            })
                        }).catch(error => {
                            reject({
                                status: 'error',
                                msg: 'tag check error'
                            })
                        })*/
                    })

                    res.end(JSON.stringify({
                        img: url,
                        name: imgName,
                        category: lib.getDayDir('-')
                    }))
                }).catch(error => {
                    console.log('promise2 error', error)
                })

            }).catch(error => {
                console.log('promise error', error)
            })
        })

        /*app.get('/:page', (req, res) => {

        })*/

        app.post('/login', (req, res) => {
            //console.log('Cookies: ', req.cookies)
            console.log("/login", req);

            lib.postDataCheckAction(req, res, userLoginCheckArr, result => {
                console.log("login", result)
                User.findOne({
                    where: {
                        email: result.email,
                        password: result.password
                    }
                }).then(function(user) {
                    console.log("findOne", user)
                    if (user) {
                        lib.okRes(res, '登录成功！', {}, lib.setCookie('email', result.email, 365));
                    } else {
                        //lib.setCookie('email', 'test' + result.email, 365)
                        lib.errRes(res, '登录失败！');
                    }
                })
            });
        })

        app.post('/register', (req, res) => {
            lib.postDataCheckAction(req, res, userLoginCheckArr, result => {
                User.findOne({
                    where: {
                        email: result.email,
                        password: result.password
                    }
                }).then(function(user) {
                    console.log("findOne", user)
                    if (user) {
                        lib.okRes(res, '用户已存在，注册失败！', {}, {

                        });
                    } else {
                        //lib.errRes(res, '注册失败！');
                        User.create({
                            email: result.email,
                            password: result.password
                        }).then(user => {
                            lib.okRes(res, '注册成功！');
                        })
                    }
                })
                /*User.findOrCreate({
                    where: {
                        name: result.name,
                        email: result.email,
                        password: result.password
                    }
                }).then(function(user, created) {
                    console.log("findOrCreate", user, created)
                    if (created) {
                        lib.okRes(res, '注册成功！');
                    } else {
                        lib.errRes(res, '注册失败！');
                    }
                })*/
            });
        })

        app.post('/', (req, res) => {
            console.log("req", req)
            //res.status(404).send('invalid token...')
        })

    }
}

exports.Router = Router