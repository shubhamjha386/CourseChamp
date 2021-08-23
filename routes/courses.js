const express = require("express");
const router = express.Router();
const {storage} = require('../cloudinary/index');
const multer  = require('multer');
const upload = multer({storage});
const ejsLint = require('ejs-lint');
ejsLint('courses/show');

const Course = require("../models/courses");
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync");
const {isloggedin,isCreator} = require('../middleware');
const {courseSchema} = require('../joivalidate');
const { populate } = require("../models/courses");

const validateCourse = (req,res,next)=>{
  const {error} = courseSchema.validate(req.body);
  if(error)
    {
      const msg = error.details.map(el=>el.message).join(',');
      throw new AppError(msg,400);
    }
  else
    next();
}

router.get("/",wrapAsync(async (req, res) => {
    const courses = await Course.find({});
    if(!courses)
      {
        req.flash('error','Cannot find courses');
        return res.redirect('/');
      }
    res.render("courses/index", { courses });
  }));
router.get("/submit", isloggedin,  (req, res) => {
  res.render("courses/submit");
});

router.get("/:id",wrapAsync(async (req, res) => {
  const coursed = await (await (await Course.findById(req.params.id).populate(       // nested populate first for course and then for review
    { path:'reviews',
     populate:{
    path: 'creator'}
}).populate('creator'))); 
  if(!coursed)
      {
        req.flash('error','Cannot find the course');
        res.redirect('/courses');
      }
  res.render("courses/show", { coursed });
}));

router.get("/:id/edit",isloggedin,  isCreator, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const cte = await Course.findById(id);
  res.render("courses/edit", { cte });
}));

router.post("/", isloggedin, upload.array('image'), validateCourse, wrapAsync(async (req, res) => {
  const course = new Course(req.body.course);
  course.images = req.files.map( f=> ({url:f.path, filename: f.filename}));
  course.creator = req.user._id;
  await course.save();
  req.flash('success','Successfully submitted a new course');
  res.redirect(`courses/${course._id}`);
}));

router.put("/:id", isloggedin, isCreator, upload.array('image'), validateCourse, wrapAsync(async (req, res) => {
  const {id} = req.params;
  const Cedited = await Course.findByIdAndUpdate(id, { ...req.body.course });
  const imgs = req.files.map( f=> ({url:f.path, filename: f.filename}));
  Cedited.images.push(...imgs);
  await Cedited.save();
  req.flash('success','Successfully updated!');
  res.redirect(`/courses/${id}`);
}));

router.delete("/:id", isloggedin, isCreator, wrapAsync(async (req, res) => {
  const {id} = req.params;
  await Course.findByIdAndDelete(id);
  req.flash('success','Course deleted');
  res.redirect("/courses");
}));

module.exports = router;