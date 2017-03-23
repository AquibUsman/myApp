// app/routes.js
var mysql = require("sqlite3").verbose();
var path = require('path')
var file = path.resolve(__dirname, 'test.db')
var db = new mysql.Database(file); 
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/shop', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),
        function(req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/shop', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    //addData
    app.get('/additem',isLoggedIn, function(req, res, next) {
        res.render('add',{
            title: "Add Item",
            user: req.user.username
        });
    });

    app.post('/additem', function(req,res,next){
    
        var name=req.body.name;
        var cat=req.body.category;
        var qry=db.prepare("insert into medical values ('"+name+"','"+cat+"')");
        qry.run(function(err){
            if(err){
                res.render("error");
            }
            else
            {console.log('insertion successful');
                res.render('additem');}
        });
    });


    //SEARCH
    app.get('/shop',isLoggedIn, function(req, res, next) {
        var qry = "select * from medical";
        db.all(qry,function(error,rows){
            var row=[],i=0;
            for (var i=0; i < rows.length; i++) {
                var newElement = {};
                newElement['name'] = rows[i].name;
                newElement['category'] = rows[i].category;
                row.push(newElement);
            }
            console.log(req.user.username);
            res.render('shop',{data:row,user: req.user.username});

        });

    });


    app.post('/shop', function(req,res,next){
        var name=req.body.name;
        var cat=req.body.category;
        if(req.body.f==1)
        {

            var qry="update medical set name='"+name+"', category='"+cat+"' where name like '"+name+"' or category like '"+cat+"'";
            db.run(qry, function (err) {
                if (err) {
                    res.render("error");
                }
                else {
                    console.log('updation successful');
                    res.render('additem');
                }
            });
        }
        else {
            var qry = "delete from medical where name like '" + name + "'";
            console.log(qry);
            db.run(qry, function (err) {
                if (err) {
                    res.render("error");
                }
                else {
                    console.log('deletion successful');
                    res.render('additem');
                }
            });
        }
    });

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}