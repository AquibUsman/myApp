// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
// load up the user model
var mysql = require("sqlite3").verbose();
var path = require('path')
var file = path.resolve(__dirname, 'test.db')
var bcrypt = require('bcrypt-nodejs');
var db = new mysql.Database(file);  
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.serialize(function() {
        var qry ="SELECT * FROM users WHERE id ="+id;
        db.all(qry , function(err, rows){
            console.log(rows);
            done(err, rows[0]);
        });
    });
      //  db.close();
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            db.serialize(function() {
            db.all("SELECT * FROM users WHERE username ='" +username+"'", function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var s="select count(*) as \"c\" from users"; 
                    db.all(s,function(err,rows){
                        console.log("count:  "+rows[0].c);
                        newUserMysql.id=rows[0].c + 1;
                    var insertQuery = "INSERT INTO users values ("+newUserMysql.id+",'"+newUserMysql.username+"','"+newUserMysql.password+"')" ;
                    console.log(insertQuery);
                    db.run(insertQuery,function(err, rows) {
                        return done(null, newUserMysql);
                    });
                    });
                }
            });
        });
        //    db.close();
        })
        
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.serialize(function() {
           
            db.all("SELECT * FROM users WHERE username = '"+username+"'", function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        });
        //    db.close();
        })
    );
};
