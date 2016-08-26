'use strict'
const express = require('express')
const path = require('path')
const app = express()
const config = require('./config.js').setting[app.get('env')];

const {PORT:PORT, HOST:HOST, HTTP:HTTP, UPLOAD_URL:UPLOAD_URL, UPLOAD_DIR:UPLOAD_DIR, CORS_DOMAIN:CORS_DOMAIN, IMG_PREFIX:IMG_PREFIX, SQL_DIR:SQL_DIR} = config;

//http://itbilu.com/nodejs/npm/VkYIaRPz-.html
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
// 或者可以简单的使用一个连接 uri
// sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

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
    /*
Utils deprecated Non-object references property found. Support for that will be removed in version 4. Expected { references: { model: "value", key: "key" } } instead of { references: "value", referencesKey: "key" }
*/
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
Img.belongsTo(User, {
    foreignKey: 'userId'
});

const Tag = sequelize.define('tag', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
})

const ImgTags = sequelize.define('imgtags', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
})

Img.belongsToMany(Tag, {
    through: ImgTags
});
Tag.belongsToMany(Img, {
    through: ImgTags
});

sequelize.sync()
//Img.drop()
Img.sync()
User.sync()
Tag.drop()
Tag.sync()
ImgTags.drop()
ImgTags.sync()

exports.Img = Img
exports.User = User
exports.Tag = Tag
exports.ImgTags = ImgTags
