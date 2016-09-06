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
const eachPage = 10
const defaultUser = 'guest@img.pinbot.me';

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
        more = {},
        include = [],
        parseBeforeCb = undefined
    } = {}) {
        tbIns.findAndCountAll({
            where: where,
            offset: offset,
            limit: eachPage,
            order: order,
            include: include
        }).then(result => {
            let reloadScriptHtml = (app.get('env') === 'development') ? '<script src="/reload/reload.js"></script>' : ''
            res.send(tmplCb(result.count, cp, eachPage, result.rows, more) + reloadScriptHtml)
        })
    }
}

const showTags = (imgId, more) => {
  console.log("showTags imgId", imgId)
  return new Promise((resolve3, reject3)=>{
    let p = new Promise((resolve, reject) => {
        Img.findOne({
            where: {
                id: imgId
            }
        }).then(img => {
            //console.log("getTags img", img)
            img.getTags().then(function(tags) {
                resolve(tags)
            })
            //return "xxx";
        }).catch(result => {
            reject(null)
        })
    });
    p.then(tags => {

        let tagNames = [];
        let result = more
        if (tags) {
            for (let t of tags) {
                tagNames.push('<a href="/tag/'+t.get('name')+'">'+t.get('name')+'</a>')
            }
            console.log("tagNames", tagNames)
        }
        if(!result.tags) result.tags = {}
        result.tags['t'+imgId] = tagNames.join(', ')
        console.log("result.tags", result.tags)
        resolve3(result)

    })
  })

};
//console.log("showTags(5)", showTags(5))

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

        const renameCheckArr = [{
            name: 'rename-name',
            required: true,
            reg: new RegExp("^[0-9a-z_\\.\\-]+\\.[0-9a-z]{2,}$", "i"),
            msg: '请输入图片名！！'
        }];

        const remarkCheckArr = [{
            name: 'remark-name',
            required: true,
            reg: new RegExp("^[\\S]{2,}$", "i"),
            msg: '请输入注释！！'
        }];

        const tagnameCheckArr = [{
            name: 'tag-name',
            required: true,
            reg: new RegExp("^[\\S\\s]{1,250}$", "i"),
            msg: '请输入标签(多个标签用空格分割)！'
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



                //if (!req.user.admin) return res.sendStatus(401)
                //console.log('Cookies: ', req.cookies);
                let currentUser = (req.cookies.email && req.cookies.email.match(lib.commonReg.email)) ? req.cookies.email : defaultUser;
                let currentInclude = [];
                if (currentUser !== defaultUser) {
                    currentInclude = [{
                        model: User,
                        as: 'user',
                        where: {
                            email: currentUser
                        }
                    }];
                }
                let more = {
                    link: CORS_DOMAIN
                };
                showTags(1, more).then(more => {
                    return showTags(2, more)
                }).then(more => {
                    return showTags(3, more)
                }).then(more => {
                    return showTags(4, more)
                }).then(more => {
                    return showTags(5, more)
                }).then(more => {
                    console.log('^^more', more);
                    Controller.pageList(res, Img, tmpl.indexTmpl, {
                        cp: 1,
                        where: {},
                        offset: 0,
                        eachPage: eachPage,
                        order: [
                            ['id', 'DESC']
                        ],
                        more: more,
                        include: currentInclude
                    });
                })

            })

        app.get('/:page', (req, res) => {

            //console.log('Cookies: ', req.cookies);
            let cp = 1
            if (typeof req.params.page === 'string' && req.params.page.match(/^[0-9]+$/i)) cp = req.params.page;
            let offset = eachPage * (parseInt(cp, 10) - 1);
            let currentUser = (req.cookies.email && req.cookies.email.match(lib.commonReg.email)) ? req.cookies.email : defaultUser;
            let currentInclude = [];
            if (currentUser !== defaultUser) {
                currentInclude = [{
                    model: User,
                    as: 'user',
                    where: {
                        email: currentUser
                    }
                }];
            }
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
                },
                include: currentInclude
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
                            let act = lib.fsAction.rename(file.path, path.join(form.uploadDir, imgName));
                            act.catch(result => {
                                console.log('save image failed', path.join(form.uploadDir, imgName));
                            });
                            /*fs.rename(file.path, path.join(form.uploadDir, imgName), function(err) {
                                if (err) {
                                    //throw err;
                                    reject({
                                        status: 'error',
                                        msg: 'save failed'
                                    })
                                }
                            })*/
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
                        if (!fields || !fields.email) reject({
                            status: 'error',
                            msg: 'email not found'
                        })

                        if (fields.email.match(emailPattern)) {
                            userName = RegExp.$1
                        } else {
                            reject({
                                status: 'error',
                                msg: 'invalid email'
                            })
                        }

                        //判断用户是否存在
                        User.findOrCreate({
                            where: {
                                email: fields.email
                            },
                            defaults: {
                                name: userName
                            }
                        }).then((user, created) => {
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
                        }).then((tag,created) => {
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
                        let jwtSecret = 'fds9cxzcafs2';
                        /*let token = jwt.sign({
                            email: result.email
                        }, jwtSecret);*/
                        console.log('token', jwt);
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
                        lib.okRes(res, '用户已存在，注册失败！', {}, {});
                    } else {
                        //lib.errRes(res, '注册失败！');
                        let name = '';
                        if (result.email.match(/^([^@]+)/i)) name = RegExp.$1;
                        User.create({
                            name: name,
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


        app.post('/rename', (req, res) => {
            //console.log('Cookies: ', req.cookies)
            //lib.errRes(res, '系统维护中！');
            if (!req.cookies || !req.cookies.email || !req.cookies.email.match(lib.commonReg.email)) lib.errRes(res, '请先登录！');
            lib.postDataCheckAction(req, res, renameCheckArr, result => {
                console.log("rename", result);
                let newName = '';
                let newUrl = '';
                let imgPath = '';
                let newImgPath = '';
                if (!result.id || !result.name || !result.name.match(/^([0-9a-z_\-]+)\.([0-9a-z]+)$/i)) lib.errRes(res, '无效图片名！');
                newName = result.name;
                Img.findOne({
                    where: {
                        id: result.id
                    },
                    include: Router.userInclude(req.cookies.email)
                }).then(function(img) {
                    if (!img) lib.errRes(res, '没有这个图片！');
                    //console.log("findOne img", img.get('url'));
                    if (img.get('name') === newName) {
                        //console.log('同名文件！', result);
                        lib.errRes(res, '请确认修改成不同的图片名！');
                    }

                    let pCount = lib.sql.count(Img, {
                        name: newName
                    });
                    pCount.then(count => {
                        //http://localhost:8080/uploads/2016/8/29/blob_1472460770322.png
                        if (!img.get('url') || !img.get('url').match(/^(.+)(\/uploads\/)([0-9]+\/[0-9]+\/[0-9]+\/)([^\/]+)$/i)) lib.errRes(res, '图片名无效！');
                        newUrl = RegExp.$1 + RegExp.$2 + RegExp.$3 + newName;
                        imgPath = __dirname + '/uploads/' + RegExp.$3 + RegExp.$4;
                        newImgPath = __dirname + '/uploads/' + RegExp.$3 + newName;
                        //修改文件名
                        let act = lib.fsAction.rename(imgPath, newImgPath);
                        act.then(result => {
                            let promise2 = lib.sql.transactionUpdatePromise(db.sequelize, Img, {
                                name: newName,
                                url: newUrl
                            }, {
                                id: img.get('id')
                            }, Router.userInclude(req.cookies.email));
                            promise2.then(result => {
                                console.log('修改文件名成功！', result);
                                lib.okRes(res, '修改成功！');
                            }).catch(result => {
                                //还原文件名
                                console.log('还原文件名', result);
                                let act2 = lib.fsAction.rename(newImgPath, imgPath);
                                lib.errRes(res, '修改图片名失败！T');
                            });
                        }).catch(result => {
                            lib.errRes(res, '修改图片名失败！');
                        });
                    }).catch(result => {
                        lib.errRes(res, '图片已存在！');
                    });
                })
            });
        })

        app.post('/remark', (req, res) => {
            //console.log('Cookies: ', req.cookies)
            //lib.errRes(res, '系统维护中！');
            if (!req.cookies || !req.cookies.email || !req.cookies.email.match(lib.commonReg.email)) lib.errRes(res, '请先登录！');
            lib.postDataCheckAction(req, res, remarkCheckArr, result => {
                console.log("remark", result);
                if (!result.id || !result.option) lib.errRes(res, '备注丢失！');
                Img.findOne({
                    where: {
                        id: result.id
                    },
                    include: Router.userInclude(req.cookies.email)
                }).then(function(img) {
                    if (!img) lib.errRes(res, '没有这个图片！');
                    //console.log("findOne img", img.get('url'));
                    let promise2 = lib.sql.transactionUpdatePromise(db.sequelize, Img, {
                        option: result.option
                    }, {
                        id: img.get('id')
                    }, Router.userInclude(req.cookies.email));
                    promise2.then(result => {
                        console.log('修改备注成功！', result);
                        lib.okRes(res, '修改备注成功！');
                    }).catch(result => {
                        lib.errRes(res, '修改备注失败！T');
                    });
                })
            });
        })

        app.post('/tagname', (req, res) => {
            //console.log('Cookies: ', req.cookies)
            //lib.errRes(res, '系统维护中！');
            if (!req.cookies || !req.cookies.email || !req.cookies.email.match(lib.commonReg.email)) lib.errRes(res, '请先登录！');
            lib.postDataCheckAction(req, res, tagnameCheckArr, result => {
                console.log("tagname", result);
                if (!result.id || !result.name) lib.errRes(res, '标签丢失！');
                //最多10个标签／每图
                let pCount = lib.sql.count(ImgTags, {
                    imgId: result.id
                });
                pCount.then(count => {
                    if (count >= 10) {
                        lib.errRes(res, '每个图最多添加十个标签！');
                    }
                    let tags = result.name.trim().split(' ');
                    if (count + tags.length > 10) {
                        lib.errRes(res, '每个图最多添加十个标签！');
                    }
                    let tagMap = [];
                    for (let item of tags) {
                        tagMap.push({
                            name: item
                        })
                    }
                    /*Tag.bulkCreate(tagMap).then(() => {
                        return Tag.findAll({
                            where: {
                                name: {
                                    $in: tags
                                }
                            }
                        });
                    }).then(function(tagAll) {
                        console.log('tagAll', tagAll)
                    })*/
                    let pList = [];
                    for (let item of tags) {
                        pList.push(new Promise((resolve, reject) => {
                            Tag.findOne({
                                where: {
                                    name: item
                                }
                            }).then((tag) => {
                                return new Promise((resolve2, reject2) => {
                                    if (!tag) {
                                        Tag.create({
                                            name: item
                                        }).then(newtag => {
                                            resolve2(newtag)
                                        }).catch(newtag => {
                                            reject2(newtag)
                                        })
                                    } else {
                                        resolve2(tag)
                                    }
                                });
                            }).then(tag => {
                                if (tag) {
                                    console.log('tagid', tag.get('id'))
                                    ImgTags.findOne({
                                        where: {
                                            imgId: result.id,
                                            tagId: tag.get('id')
                                        }
                                    }).then(imgtag => {
                                        if (!imgtag) {
                                            ImgTags.create({
                                                imgId: result.id,
                                                tagId: tag.get('id')
                                            })
                                        }
                                        resolve(tag.get('id'))
                                    }).catch(function(reason) {
                                        reject('添加标签失败')
                                    });
                                } else {
                                    reject('添加标签失败')
                                }
                            }).catch(function(reason) {
                                reject(reason)
                            });
                        }));
                    }
                    let pAll = Promise.all(pList);
                    console.log("pList", pList)
                    pAll.then(function(posts) {
                        lib.okRes(res, '添加标签成功！');
                    }).catch(function(reason) {
                        lib.errRes(res, '添加标签失败！T' + count + '=' + tags.length + ": " + reason);
                    });
                });
            });
        })

    }

    static userInclude(email) {
        return [{
            model: User,
            as: 'user',
            where: {
                email: email
            }
        }];
    }
}

exports.Router = Router