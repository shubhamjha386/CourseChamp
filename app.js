const express = require("express");
const app = express();
const path = require("path");
const method = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/AppError");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy =require('passport-local');
const User = require('./models/user');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')


if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://admin-ansh:anshsarin00@cluster0.2l6ki.mongodb.net/project-s11", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error occured");
    console.log(err);
  });

const sessionConfig = {
  secret: 'MustBeaEnvironmentVariable',
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 1000*60*60*24*7,// Will expire in a week
    maxAge: 1000*60*60*24*7
  }
}

const courseRoutes = require('./routes/courses');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(method("_method"));
app.engine("ejs", ejsMate);
app.use(express.static( path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/auth/google/coursechamp",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentuser = req.user;
    next();
})

app.use('/',userRoutes);
app.use('/courses',courseRoutes);

app.use('/courses/:id/reviews',reviewRoutes);



app.get("/", (req, res) => {
  res.render("home");
});

app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/coursechamp', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


app.all("*",(req,res,next)=>{
  throw new AppError("Page not Found",404);
})
app.use((err,req,res,next)=>{
    const {status=500,message="Something Went Wrong",stack} = err;
    res.status(status).render("error",{status,message,stack});
})
app.listen(4000, () => {
  console.log("On port 4000");
});
