// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var favicon = require('serve-favicon');
//var port     = process.env.PORT || 8080;
var path = require('path');
var passport = require('passport');
var flash    = require('connect-flash');


// configuration ===============================================================

app.use(express.static(__dirname + '/public'));
// connect to our database
require('./config/passport')(passport); // pass passport for configuration



// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// required for passport
app.use(session({
    secret: 'secretaanu',
    resave: true,
    saveUninitialized: true
} )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
module.exports = app;
//app.listen(port);
//console.log('The magic happens on port ' + port);
