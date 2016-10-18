//nodedoc: http://millermedeiros.github.io/mdoc/examples/node_api/doc/index.html
'use strict'
const express = require('express')
const formidable = require('formidable')
const jwt = require('jsonwebtoken');
const fs = require('fs')
const app = express()
const config = require('./config.js').setting[app.get('env')];

const {
    PORT: PORT,
    HOST: HOST,
    HTTP: HTTP,
    CORS_DOMAIN: CORS_DOMAIN
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
        //console.log('b64_to_utf80', str);
        str = str.trim().replace(/[\s]/ig, '+')
        //console.log('b64_to_utf81', str);
        return new Buffer(str, 'base64').toString('utf8');
    },
    formatDate: (format, ts) => {
        let tsDate = (ts != undefined && typeof ts == 'number') ? new Date(ts) : new Date();
        let o = {
            "M+": tsDate.getMonth() + 1,
            // month
            "d+": tsDate.getDate(),
            // day
            "h+": tsDate.getHours(),
            // hour
            "m+": tsDate.getMinutes(),
            // minute
            "s+": tsDate.getSeconds(),
            // second
            "q+": Math.floor((tsDate.getMonth() + 3) / 3),
            // quarter
            "S": tsDate.getMilliseconds()
            // millisecond
        };
        //console.log('o',o);
        if (/(y+)/.test(format) || /(Y+)/.test(format)) {
            format = format.replace(RegExp.$1, (tsDate.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (o.hasOwnProperty(k) && new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 获取日期对象
     * @param  {object}  t         Date日期对象
     * @param  {Boolean} isLeftPad 是否需要前置零
     * @return {object}            返回年月日时分秒的对象
     */
    getDateObj: (t, isLeftPad) => {
        /**
         * 前置零实现函数
         * @param  {string} n 需要处理的数字
         * @return {string}   返回添加前置零的数字
         */
        let leftPadZero = function(n) {
            if (parseInt(n) < 10) {
                return '0' + n;
            } else {
                return '' + n;
            }
        };
        let dt;
        if (t != undefined) {
            if (typeof t == 'string' || typeof t == 'number') {
                dt = new Date(t); //'9/24/2015 14:52:10' || 1450656000000
            } else if (typeof t == 'object' && t.constructor == Date) {
                dt = t;
            } else {
                dt = new Date();
            }
        } else {
            dt = new Date();
        }
        let m = (isLeftPad !== undefined && isLeftPad) ? leftPadZero(dt.getMonth() + 1) : dt.getMonth() + 1;
        let d = (isLeftPad !== undefined && isLeftPad) ? leftPadZero(dt.getDate()) : dt.getDate();
        let h = (isLeftPad !== undefined && isLeftPad) ? leftPadZero(dt.getHours()) : dt.getHours();
        let i = (isLeftPad !== undefined && isLeftPad) ? leftPadZero(dt.getMinutes()) : dt.getMinutes();
        let s = (isLeftPad !== undefined && isLeftPad) ? leftPadZero(dt.getSeconds()) : dt.getSeconds();
        return {
            y: dt.getFullYear(),
            m: m,
            d: d,
            h: h,
            i: i,
            s: s
        };
    },
    //通过位移获取时间对象
    getDateByOffset: (trg, offset, t, isLeftPad) => {
        let currDateObj = this.getDateObj(t);
        let newDate = null;
        let _offset = parseInt(offset);
        if (isNaN(_offset)) _offset = 0;
        if (trg === 'y') {
            newDate = new Date(currDateObj.y + _offset, currDateObj.m - 1, currDateObj.d, currDateObj.h, currDateObj.i, currDateObj.s);
        } else if (trg === 'm') {
            newDate = new Date(currDateObj.y, currDateObj.m - 1 + _offset, currDateObj.d, currDateObj.h, currDateObj.i, currDateObj.s);
        } else if (trg === 'd') {
            newDate = new Date(currDateObj.y, currDateObj.m - 1, currDateObj.d + _offset, currDateObj.h, currDateObj.i, currDateObj.s);
        } else if (trg === 'h') {
            newDate = new Date(currDateObj.y, currDateObj.m - 1, currDateObj.d, currDateObj.h + _offset, currDateObj.i, currDateObj.s);
        } else if (trg === 'i') {
            newDate = new Date(currDateObj.y, currDateObj.m - 1, currDateObj.d, currDateObj.h, currDateObj.i + _offset, currDateObj.s);
        } else if (trg === 's') {
            newDate = new Date(currDateObj.y, currDateObj.m - 1, currDateObj.d, currDateObj.h, currDateObj.i, currDateObj.s + _offset);
        }
        return this.getDateObj(newDate, isLeftPad);
    },
    getTimestamp: (dateStr) => {
        let dt = (typeof dateStr === 'string') ? new Date(dateStr) : new Date();
        return Math.round(dt.getTime() / 1000);
    },
    getTimestampMs: (dateStr) => {
        let dt = (typeof dateStr === 'string') ? new Date(dateStr) : new Date();
        return Math.round(dt.getTime());
    },
    getTs: () => {
        return Math.round((new Date()).getTime() / 1000);
    },
    countDaysByMonth: (currentTs, monthNum) => {
        let monthStart = new Date(currentTs);
        let monthStartObj = this.getDateObj(currentTs);
        //year, month, day, hour, minute, second, and millisecond
        let monthEnd = new Date(monthStartObj.y, monthStartObj.m - 1 + monthNum, monthStartObj.d, monthStartObj.h, monthStartObj.i, monthStartObj.s);
        let dayLength = (monthEnd - monthStart) / 86400000;
        return dayLength;
    },
    getExpiredDateArr: (currentTs, monthNum) => {
        let monthStart = new Date(currentTs);
        let monthStartObj = this.getDateObj(currentTs);
        let monthEnd = new Date(monthStartObj.y, monthStartObj.m - 1 + monthNum, monthStartObj.d, monthStartObj.h, monthStartObj.i, monthStartObj.s);
        let endTs = this.getTimestampMs(monthEnd);
        return [endTs, this.formatDate('yyyy-MM-dd hh:mm:ss', endTs)];
    }
};

const formPostAction = (req, res, cb) => {
    let form = new formidable.IncomingForm();
    let subPromise = new Promise((resolve, reject) => {

        //console.log('req', req);
        form.parse(req, function(err, fields, files) {

            for (let t in fields) {
                //console.log('fields0', t, fields[t]);
                fields[t] = func.b64_to_utf8(fields[t])
                //console.log('fields1', t, fields[t]);
            }
            console.log("form.parse", fields);
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
        'Set-Cookie': key + '=' + func.utf8_to_b64(value) + ';expires=' + expires.toUTCString() + ';path=/;'
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
            //暂不删除
            /*fs.unlink(filename, function(err) {
                if (err) {
                    //throw err;
                    resolve({
                        status: 'error',
                        msg: 'unlink failed'
                    })
                } else {
                    resolve({
                        status: 'ok',
                        msg: 'unlink ok'
                    })
                }
            });*/
            resolve({
                status: 'ok',
                msg: 'unlink ok'
            })
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

const jwtFunc = {
    cert: fs.readFileSync('./db/id_rsa_img_pinbot_me_jwt'),
    pem: fs.readFileSync('./db/id_rsa_img_pinbot_me_jwt.pem'),
    passphrase: 'adamgogogo',
    genExp: () => {
        return Math.round((new Date()).getTime()) + 600000
    },
    newToken: (data, callback) => {
        jwt.sign(data, {
            key: this.jwtFunc.cert,
            passphrase: this.jwtFunc.passphrase
            //not before
        }, {
            algorithm: 'RS256',
            //expiresIn: '1h' //'d h days'
        }, function(err, token) {
            callback(err, token);
        });
    },
    verifyToken: (token, callback) => {
        jwt.verify(token, this.jwtFunc.pem, {
            algorithms: ['RS256']
        }, function(err, payload) {
            callback(err, payload);
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
exports.jwtFunc = jwtFunc