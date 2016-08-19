// app.js
'use strict'

const express = require('express')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
    //const koa = require('koa')

// App
const app = express()

console.log("env", app.get('env'))
const config = require('./config.js').setting[app.get('env')]
console.log("config", config)

//tmpl
const tmpl = require('./tmpl.js')

// Constants
const PORT = config['PORT']
const HOST = config['HOST']
const HTTP = config['HTTP']
const UPLOAD_URL = config['UPLOAD_URL']
const UPLOAD_DIR = config['UPLOAD_DIR']
const CORS_DOMAIN = config['CORS_DOMAIN']
const IMG_PREFIX = config['IMG_PREFIX']
const SQL_DIR = config['SQL_DIR']

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

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: path.join(__dirname, '/' + SQL_DIR + '/database.sqlite')
})

//http://docs.sequelizejs.com/en/stable/docs/models-definition/
const Img = sequelize.define('img', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    option: {
        type: Sequelize.STRING,
        allowNull: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    }
})
const User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            unique: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true
        }
    })
    //Img.belongsTo(User, {foreignKey: 'userId'});
sequelize.sync()
//Img.drop()
Img.sync()



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

app.get('/', (req, res) => {
    Img.findAndCountAll({
        where: {},
        offset: 0,
        limit: 10,
        order: [
            ['id', 'DESC']
        ]
    }).then(result => {
        //console.log('result.count', result.count);
        //console.log('result.rows', result.rows);
        let more = {
            link: CORS_DOMAIN
        };
        res.send(tmpl.indexTmpl(result.count, 1, eachPage, result.rows, more))
    })
})

app.get('/:page', (req, res) => {
    let cp = 1
    if (typeof req.params.page === 'string' && req.params.page.match(/^[0-9]+$/i)) cp = req.params.page
    const eachPage = 10
    let offset = eachPage * (parseInt(cp, 10) - 1)
    Img.findAndCountAll({
        where: {},
        offset: offset,
        limit: eachPage,
        order: [
            ['id', 'DESC']
        ]
    }).then(result => {
        //console.log('result.count', result.count);
        //console.log('result.rows', result.rows);
        let more = {
            link: CORS_DOMAIN
        };
        res.send(tmpl.indexTmpl(result.count, cp, eachPage, result.rows, more))
    })
})

app.post('/' + UPLOAD_URL, (req, res) => {
    let imgName;
    // create an incoming form object
    let form = new formidable.IncomingForm()

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/' + UPLOAD_DIR + '/' + getDayDir())
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
        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', (field, file) => {
            //console.log('file', file.path, form.uploadDir, file.name);
            imgName = `${IMG_PREFIX}${new Date().getTime()}` + '.png'
            fs.rename(file.path, path.join(form.uploadDir, imgName))
        })

        // log any errors that occur
        form.on('error', err => {
            console.log('An error has occured: \n' + err)
        })

        // once all the files have been uploaded, send a response to the client
        form.on('end', () => {
            let url = imgUrlPrefix(UPLOAD_DIR) + imgName
            Img.create({
                name: imgName,
                category: getDayDir(),
                url: url
            }).then(img => {
                console.log('insert img', img.get('name'))
            })

            res.end(JSON.stringify({
                img: url,
                name: imgName,
                category: getDayDir('-')
            }))
        })

        // parse the incoming request containing the form data
        // https://github.com/felixge/node-formidable
        form.parse(req, (err, fields, files) => {
            /*res.writeHead(200, {
                'content-type': 'text/plain'
            });
            res.write('received upload:\n\n');
            res.end(util.inspect({
                fields: fields,
                files: files
            }));*/
        })
        //console.log('form', form);
    }).catch(error => {
        console.log('promise error', error)
    })

})

app.listen(PORT)
console.log('Running on ' + imgUrlPrefix())