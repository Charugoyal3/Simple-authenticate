var express = require("express");
var mongoose = require("mongoose");
var app = express();
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("F:/work/Authentication/models/user.js");
mongoose.connect("mongodb://localhost/auth_demo_app");

app.use(
    require("express-session")({
        secret: "Can do anything and everything",
        resave: false,
        saveUninitialized: false
    })
);
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
//===============

//INDEX ROUTE
app.get("/", function (req, res) {
    res.render("home");
});

//SECRET ROUTE
app.get("/secret", isLoggedIn, function (req, res) {
    console.log(isAuthenticated());
    res.render("secret");
});

//AUTH ROUTES
//show sign up form
app.get("/register", function (req, res) {
    res.render("register");
});
//handling user sign up
app.post("/register", function (req, res) {

    User.register(
        new User({
            username: req.body.username
        }),
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secret");
            });
        }
    );
});

//LOGIN ROUTES
//render login form
app.get("/login", function (req, res) {
    res.render("login");
});

//login logic
//middleware-runs before the final callout of function
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/secret",
        failureRedirect: "/login"
    }),
    function (req, res) {}
);

//logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("Server has started");
});