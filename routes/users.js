const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const { isloggedin } = require("../middleware");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { compareDocumentPosition } = require("domutils");

const GOOGLE_CLIENT_ID =
  "3908841842-sck3jdpifmjtbcj4ucqvdvgsac2cgqvt.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

router.get("/register", (req, res) => {
  res.render("auth/register");
});
router.post(
  "/register",
  wrapAsync(async (req, res) => {
    try {
      const source = "local";
      const photo = "https://i.ibb.co/bH5N5qk/user.png";
      const { fullname, username, email, password } = req.body;
      const user = new User({ email, username, fullname, photo, source });
      const newuser = await User.register(user, password);
      console.log(newuser);
      req.login(newuser, (err) => {
        if (err) return next(err);
        req.flash("success", "Successfully registered");
        res.redirect("/courses");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);
router.get("/login", (req, res) => {
  res.render("auth/login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Logged in");
    const redirectURl = req.session.returnto || "/courses";
    delete req.session.returnto;
    res.redirect(redirectURl);
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", " Logged out");
  const redirectURl = req.session.returnto || "/courses";
  delete req.session.returnto;
  res.redirect(redirectURl);
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: `http://localhost:4000/auth/google/coursechamp`,
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const username = email.split("@")[0];
      const fullname = `${profile.name.givenName} ${profile.name.familyName}`;
      const photo = profile.photos[0].value;
      const source = "google";
      const currentUser = await User.findOne({ email });

      if (!currentUser) {
        const user = new User({
          email,
          username,
          fullname,
          photo,
          source,
        });
        user.save();
        console.log(user);
        return done(null, user);
      }

      if (currentUser.source != "google") {
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }
      return done(null, currentUser);
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/auth/google/coursechamp",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Logged in");
    const redirectURl = req.session.returnto || "/courses";
    delete req.session.returnto;
    res.redirect(redirectURl);
  }
);

module.exports = router;
