'use strict'
const express = require('express')
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
        if (resHeaders.hasOwnProperty(key)) resHeaders[key] = headers[key];
    }
    //console.log("serverRes", resHeaders, resData, data)
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
    console.log("statusJsonRes", res)
    return JSON.stringify(res);
};

exports.getDateObj = getDateObj
exports.getDayDir = getDayDir
exports.imgUrlPrefix = imgUrlPrefix
exports.serverRes = serverRes
exports.statusJsonRes = statusJsonRes