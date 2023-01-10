"use strict";
const express         = require('express'); 
const app             = express();
const port            = process.env.PORT || 8081;
const path            = require('path');
const bodyParser      = require('body-parser');
const routes          = require('./route.js');
const config          = require('./config/config.js');
var multer            = require('multer');
var upload            = multer();

// let moment            = require('moment');
// let tsFormat          = moment().format(config.DateFormate).trim();
// let file              = `${config.ServerJsLogFileName}${tsFormat}${config.FileExtension}`;

/* Middleware set */
// app.use('/clients', express.static(path.join(__dirname, 'clients')));
// app.use('/settings', express.static(path.join(__dirname, 'settings')));
// app.use("/images", express.static(__dirname + '/images'));

// Add headers
app.use((req, res, next) =>
{
  if (req.method === 'OPTIONS') 
  {
    var headers = {};
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    // headers["Access-Control-Allow-Origin"] = "*";
    // headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    // headers["Access-Control-Allow-Credentials"] = false;
    // headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    // headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    res.writeHead(200, headers);
    res.end();
  }
  else
  {
    res.setHeader('Access-Control-Allow-Credentials', false);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(upload.array('image'));
    // app.use(upload.single('tile_image')) 
    // app.use(express.static('public'));
    app.use('/', routes);
    next();
  }
});

//listen port for express
app.listen(port,'0.0.0.0', (err)=>
{
  if (err) throw err;
  console.log(__dirname);
  console.log(`Running RestHub on port ${port}`);
});

