const express = require("express");
const app = express();
const path = require("path");
const method = require("method-override");
const paginate = require("express-paginate");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/AppError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
mongoose
  .connect(process.env.DatabaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error occured");
    console.log(err);
  });

const sessionConfig = {
  secret: process.env.SessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Will expire in a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const courseRoutes = require("./routes/courses");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(method("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentuser = req.user;
  next();
});
app.use(paginate.middleware(10, 50));
app.get("/about", (req, res) => {
  res.render("layouts/about");
});

app.use("/", userRoutes);
app.use("/courses", courseRoutes);

app.use("/courses/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  throw new AppError("Page not Found", 404);
});
app.use((err, req, res, next) => {
  const { status = 500, message = "Something Went Wrong", stack } = err;
  res.status(status).render("error", { status, message, stack });
});
app.listen(4000, () => {
  console.log("On port 4000");
});
