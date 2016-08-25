var webpack = require('webpack');
var path = require('path');

var publicPath = 'http://localhost:8080/static';
var hotMiddlewareScript = './node_modules/webpack-hot-middleware/client?reload=true';

var devConfig = {
    entry: {
        index: [
            './src/index.js',
            hotMiddlewareScript
        ],
        style: [
            './src/style.js',
            './src/styles.less',
            hotMiddlewareScript
        ],
        material: [
            './src/material.js',
            hotMiddlewareScript
        ]
    },
    output: {
        filename: './[name].js',
        path: path.resolve('./static'),
        publicPath: publicPath
    },
    module: {
        loaders: [{
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            }, // 用!去链式调用loader
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            }, // 内联的base64的图片地址，图片要小于8k，直接的url的地址则不解析
            {
                test: /\.js$/, // test 去判断是否为.js,是的话就是进行es6的编译
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.html$/,
                loader: "raw-loader" // loaders: ['raw-loader']，這個方式也是可以被接受的。
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};

module.exports = devConfig;