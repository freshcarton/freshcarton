var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index.js');
var multer = require('multer');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(function(req, res, next) {
   res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-session-token,Pragma,Cache-Control,If-Modified-Since");
   next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true, parameterLimit:50000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',express.static(path.join(__dirname, 'bower_components')));
app.use('/www',express.static(path.join(__dirname, 'www')));
app.use('/tmp',express.static(path.join(__dirname, 'tmp')));
app.use('/', routes);


/*
app.configure(function (){
    app.use(express.cookieParser('keyboard cat'));
    app.use(express.session({ cookie: { maxAge: 60000 }}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
});
*/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//var sequelizeobject = require('./bin/sequelizeobject.js');
//sequelizeobject.connectToDatabase( function( err ) {
//    if(err){
//        console.log("Unable to connect to database");
//    }
//});

// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-session-token,Pragma,Cache-Control,If-Modified-Since");
//   next();
// });


/*
var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "2t62rpghphf9nmjv",
  publicKey: "vn3dpth2n3zjxb3f",
  privateKey: "6ca66a7927540f69e80143078b900ac1"
});
*/

/*
app.use(multer({
  limits: {
    fieldNameSize: 999999999,
    fieldSize: 999999999
  },
  includeEmptyFields: true,
  inMemory: true,
  onFileUploadStart: function(file) {
    console.log('Starting ' + file.fieldname);
  },
  onFileUploadData: function(file, data) {
    console.log('Got a chunk of data!');
  },
  onFileUploadComplete: function(file) {
    console.log('Completed file!');
  },
  onParseStart: function() {
    console.log('Starting to parse request!');
  },
  onParseEnd: function(req, next) {
    console.log('Done parsing!');
    next();
  },
  onError: function(e, next) {
    if (e) {
      console.log(e.stack);
    }
    next();
  }
}));
*/



module.exports = app;
