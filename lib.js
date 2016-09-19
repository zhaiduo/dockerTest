//nodedoc: http://millermedeiros.github.io/mdoc/examples/node_api/doc/index.html
'use strict'
const express = require('express')
const formidable = require('formidable')
const fs = require('fs')
const app = express()
const config = require('./config.js').setting[app.get('env')];

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

const getDateObj = (t) => {
    let dt;
    if (t !== undefined) {
        if (typeof t === 'string' || typeof t === 'number') {
            dt = new Date(t);
        } else {
            dt = new Date();
        }
    } else {
        dt = new Date();
    }
    return {
        y: dt.getFullYear(),
        m: dt.getMonth() + 1,
        d: dt.getDate(),
        h: dt.getHours(),
        i: dt.getMinutes(),
        s: dt.getSeconds()
    };
}

const getDayDir = (divider) => {
    let dt = getDateObj()
    let _divider = (typeof divider === 'string') ? divider : '/';
    return dt.y + _divider + dt.m + _divider + dt.d + _divider
}

const imgUrlPrefix = (dir) => {
    let dirname = (dir && typeof dir === 'string') ? dir + '/' : '';
    if (dir && typeof dir === 'string') dirname += getDayDir()
    return (PORT === 80) ? `${HTTP}://${HOST}/${dirname}` : `${HTTP}://${HOST}:${PORT}/${dirname}`;
}

const serverRes = (res, data, {
    code = 200,
    type = 'json',
    headers = {}
} = {}) => {
    //console.log("res", res.constructor)
    let contentType = 'text/html';
    let resData = '';
    let resHeaders = {};
    if (type === 'json') {
        contentType = 'application/json';
    }
    if (typeof data === 'object') {
        resData = JSON.stringify(data);
    } else {
        resData = data;
    }
    resHeaders['content-type'] = contentType;
    for (let key in headers) {
        if (headers.hasOwnProperty(key)) resHeaders[key] = headers[key];
    }
    //console.log("serverRes", resHeaders, resData, headers)
    res.writeHead(code, resHeaders);
    res.end(resData);
}

const statusJsonRes = (msg, {
    status = 'ok',
    more = {}
} = {}) => {
    let res = {
        status: !status.match(/^ok$/i) ? 'error' : status.toLowerCase(),
        msg: msg
    };
    for (let key in more) {
        if (more.hasOwnProperty(key)) res[key] = more[key];
    }
    //console.log("statusJsonRes", res)
    return JSON.stringify(res);
};

const errRes = (res, msg, data = {}, headers = {}) => {
    serverRes(res, statusJsonRes(msg, {
        status: 'error',
        more: data
    }), {
        headers: headers
    });
};

const okRes = (res, msg, data = {}, headers = {}) => {
    serverRes(res, statusJsonRes(msg, {
        status: 'ok',
        more: data
    }), {
        headers: headers
    });
};

const func = {
    utf8_to_b64: (t) => {
        return new Buffer(t).toString('base64');
    },
    b64_to_utf8: (str) => {
        str = str.trim().replace(/[\s]/ig, '+')
        return new Buffer(str, 'base64').toString();
    }
};

const formPostAction = (req, res, cb) => {
    let form = new formidable.IncomingForm();
    let subPromise = new Promise((resolve, reject) => {

        //console.log('req', req);
        form.parse(req, function(err, fields, files) {
            console.log('fields', fields);
            for (let t in fields) {
                fields[t] = func.b64_to_utf8(fields[t])
            }
            console.log("form.parse", err, fields, files);
            resolve(fields, err)
        });

        // log any errors that occur
        form.on('error', err => {
            //console.log('An error has occured: \n' + err)
            reject({}, err)
        })

        // once all the files have been uploaded, send a response to the client
        form.on('end', () => {
            //console.log("end", 1);
        })
    });

    subPromise.then((result, err) => {
        //console.log('subPromise then', result, err)
        if (err) {
            errRes(res, '提交表单失败！');
        } else {
            if (typeof cb === 'function') cb(result);
        }
    }).catch(error => {
        console.log('subPromise catch', error)
        errRes(res, '提交失败！');
    })
};

const postDataCheckAction = (req, res, chkRules, cb) => {
    formPostAction(req, res, result => {
        //console.log("result", result);
        const fields = result;
        if (fields) {
            let isValid = true;
            let erreFf;
            for (let ff of chkRules) {
                if (ff.required === true && fields.hasOwnProperty(ff.name) && !fields[ff.name].match(ff.reg)) {
                    isValid = false;
                    erreFf = ff;
                    break;
                }
            }
            //console.log("erreFf", erreFf, fields, isValid);
            if (isValid) {
                if (typeof cb === 'function') cb(fields);
            } else {
                errRes(res, erreFf.msg, {
                    form: erreFf.name
                });
            }
        } else {
            errRes(res, '无效提交内容！');
        }
    });
};

const setCookie = (key, value, day) => {
    let ckTime = (day !== undefined && typeof day === 'number') ? parseInt(day, 10) * 86400000 : 86400000;
    let expires = new Date();
    expires.setTime(expires.getTime() + ckTime);
    //document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;';
    return {
        'Set-Cookie': key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;'
    };
};

const delCookie = (key) => {
    let expires = new Date();
    expires.setTime(expires.getTime() - 86400);
    //document.cookie = key + '=;expires=' + expires.toUTCString() + ';path=/;';
    return {
        'Set-Cookie': key + '=;expires=' + expires.toUTCString() + ';path=/;'
    };
};

const commonReg = {
    email: new RegExp("^[0-9a-z_\\.\\-]+@[0-9a-z\\-]+\\.[0-9a-z\\.\\-]{2,}$", "i")
};

const fsAction = {
    del: (filename) => {
        return new Promise((resolve, reject) => {
            fs.unlink(filename, function(err) {
                if (err) {
                    //throw err;
                    reject({
                        status: 'error',
                        msg: 'unlink failed'
                    })
                } else {
                    resolve({
                        status: 'ok',
                        msg: 'unlink ok'
                    })
                }
            });
        });
    },
    rename: (fromNamr, toName) => {
        return new Promise((resolve, reject) => {
            fs.rename(fromNamr, toName, function(err) {
                if (err) {
                    //throw err;
                    reject({
                        status: 'error',
                        msg: 'rename failed'
                    })
                } else {
                    resolve({
                        status: 'ok',
                        msg: 'rename ok'
                    })
                }
            });
        });
    }
};

const sql = {
    transactionUpdatePromise: (sequelize, table, updateData, where, include) => {
        return sequelize.transaction().then(function(t) {
            return table.update(updateData, {
                where: where,
                include: include
            }, {
                transaction: t
            }).then(function(tab) {
                return t.commit();
            }).catch(function(err) {
                return t.rollback();
            });
        });
    },
    count: (table, where, expectCount = 0) => {
        return new Promise((resolve, reject) => {
            table.count({
                where: where
            }).then(count => {
                //console.log("count", count, expectCount)
                if (expectCount > 0 && count > expectCount) {
                    reject(count);
                } else {
                    resolve(count)
                }
            })
        });
    }
};

class reqAction {
    static go(isCanDo, actionClass) {
        if (typeof isCanDo === 'boolean' && isCanDo === true) {
            let tmpClass = new actionClass();
            tmpClass.handle();
        }

    }
}

exports.getDateObj = getDateObj
exports.getDayDir = getDayDir
exports.imgUrlPrefix = imgUrlPrefix
exports.serverRes = serverRes
exports.statusJsonRes = statusJsonRes
exports.errRes = errRes
exports.okRes = okRes
exports.formPostAction = formPostAction
exports.postDataCheckAction = postDataCheckAction
exports.setCookie = setCookie
exports.delCookie = delCookie
exports.commonReg = commonReg
exports.fsAction = fsAction
exports.sql = sql
exports.func = func