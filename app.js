// app.js
'use strict'

const express = require('express')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

// Constants
const PORT = 8080

// App
const app = express()

// Add headers
app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8088')

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

app.use('/uploads', express.static('uploads'))

app.get('/', function(req, res) {
    res.send('Welcome to upload server!\n')
})

app.post('/upload', function(req, res) {

    // create an incoming form object
    var form = new formidable.IncomingForm()

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads')

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        //console.log('file', file.path, form.uploadDir, file.name);
        fs.rename(file.path, path.join(form.uploadDir, file.name) + '.png')
    })

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err)
    })

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success')
    })

    // parse the incoming request containing the form data
    form.parse(req)
    //console.log('form', form);

})

app.listen(PORT)
console.log('Running on http://localhost:' + PORT)