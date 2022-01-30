const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require("../utils/wrapAsync");
const {isloggedin} = require('../middleware');
router.get('/register', (req,res)=>{
    res.render('auth/register');
})
router.post('/register', wrapAsync(async (req,res)=>{
    try{
    const {username,email,password} = req.body;
    const user = new User({email,username});
    const newuser = await User.register(user,password);
    req.login(newuser, err=>{
        if(err)  return next(err);
        req.flash('success',"Successfully registered");
        res.redirect('/courses');
    })
        }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('/register');
    }

}))
router.get('/login', (req,res)=>{
    res.render('auth/login');
})
router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), async(req,res)=>{

    req.flash('success','Logged in');
    const redirectURl = req.session.returnto || '/courses';
    delete req.session.returnto;
    res.redirect(redirectURl);
})

router.get('/logout', (req,res)=>{
    req.logout();
    req.flash('success'," Logged out");
    const redirectURl = req.session.returnto || '/courses';
    delete req.session.returnto;
    res.redirect(redirectURl);
})
module.exports = router;