//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
 
const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb+srv://nexusdatabase:NH2020@cluster0.vbamo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser:true})
mongoose.set("useCreateIndex", true)
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)
const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    }); 
  }  
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

app.get("/", function(req,res){
    res.render("Home")
})

app.get("/index", function(req,res){
  res.render("Home")
}) 

app.get("/cource", function(req,res){
  res.render("cource")
})

app.get("/single-blog", function(req,res){
  res.render("single-blog")
})

app.get("/physics", function(req,res){
  res.render("physics")
})

app.get("/maths", function(req,res){
  res.render("maths")
})

app.get("/elements", function(req,res){
  res.render("elements")
})

app.get("/course-details", function(req,res){
  res.render("course-details")
})

app.get("/contact", function(req,res){
  res.render("contact")
})

app.get("/blog", function(req,res){
  res.render("blog")
})

app.get("/about", function(req,res){
  res.render("about")
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

  app.get('/auth/google/home', 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

app.get("/home", function(req,res){
    res.render("Home")
})

app.get("/login", function(req,res){
    res.render("Login")
})

app.get("/logout", function(req,res){
    req.logout()
    res.redirect("/")
})
app.get("/courses", function(req,res){
    if(req.isAuthenticated()){
        res.render("/courses")} 
        else{
            res.redirect("/login")
        }

    })
app.get("/Sign_up", function(req,res){
    res.render("Sign_up")
})

app.post("Sign_up", function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
        console.log(err)
        res.redirect("/Sign_up")}

        else{
            passport.authenticate("local")(req,res, function(){
                res.redirect('/home')
            })
        }

    })
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});