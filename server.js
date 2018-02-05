var http = require('http');
var data = require('./data');
var db = require('./db');
var app = require('./app')(data, db);


http.createServer(app).listen(process.env.PORT);