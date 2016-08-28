// app.js
'use strict'

const express = require('express');
const cookieParser = require('cookie-parser');
//const koa = require('koa');
//const jwt = require('express-jwt');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevConfig = require('./webpack.config.js');
const compiler = webpack(webpackDevConfig);

// App
const reload = require('reload');
const http = require('http');
const app = express();
app.use(cookieParser());
const server = http.createServer(app);
reload(server, app);

console.log("env", app.get('env'))
const config = require('./config.js').setting[app.get('env')];
//console.log("config", config)
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

if (app.get('env') === 'development') {
    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {
        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }))
    app.use(webpackHotMiddleware(compiler))
}

const lib = require('./lib.js');

const router = require('./router.js');
let appRouter = new router.Router(app)

server.listen(PORT, function() {
    console.log('Running on ' + lib.imgUrlPrefix())
})