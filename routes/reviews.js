const express = require("express");
const router = express.Router({mergeParams: true}); // important to add id in this file

const Review = require("../models/review");
const Course = require("../models/courses");
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync");
const {reviewSchema} = require('../joivalidate');
const {isloggedin,isCreator} = require('../middleware');

const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error)
      {
        const msg = error.details.map(el=>el.message).join(',');
        throw new AppError(msg,400);
      }
    else
      next();
  }
router.post("/", isloggedin, validateReview, wrapAsync(async (req,res)=>{
    const course = await Course.findById(req.params.id);
    const review = new Review(req.body.review);
    review.creator = req.user._id;
    course.reviews.push(review);
    await review.save();
    await course.save();
    req.flash('success','Review added');
    res.redirect(`/courses/${course._id}`);
  
  }))
  
router.delete('/:reviewID', isloggedin, wrapAsync(async (req,res)=>{
    const {id,reviewID} = req.params;
    const review = await Review.findById(reviewID);
    if(!review.creator.equals(req.user._id))
    {
      req.flash('error', `You don't have permission to do that`);
      res.redirect(`/courses/${id}`);
    }
    await Course.findByIdAndUpdate(id,{$pull:{reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success','Review deleted');
    res.redirect(`/courses/${id}`);
  }))
    

module.exports = router;