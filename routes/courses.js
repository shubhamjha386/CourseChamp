const express = require("express");
const router = express.Router();
const ejsLint = require("ejs-lint");
const scrap = require("./scrap");
ejsLint("courses/show");

const Course = require("../models/courses");
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync");
const { isloggedin, isCreator } = require("../middleware");
const { courseSchema } = require("../joivalidate");
const { populate } = require("../models/courses");

const validateCourse = (req, res, next) => {
  const { error } = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  } else next();
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    let { category } = req.query;
    if (category) {
      // res.send(category);
      categories = category.split("-");
      if (categories.length == 1) {
        category = `${categories[0]}`;
      } else {
        category = `${categories[0]} & ${categories[1]}`;
      }
      const courses = await Course.find({ category: category });
      res.render("courses/index", { courses });
    } else {
      const courses = await Course.find({});
      res.render("courses/index", { courses });
    }
  })
);

router.get("/submit", isloggedin, (req, res) => {
  let response = null;
  res.render("courses/submit", { response });
});

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const coursed = await await await Course.findById(req.params.id)
      .populate(
        // nested populate first for course and then for review
        {
          path: "reviews",
          populate: {
            path: "creator",
          },
        }
      )
      .populate("creator");

    if (!coursed) {
      req.flash("error", "Cannot find the course");
      res.redirect("/courses");
    }
    category = coursed.category;
    categories = category.split(" ");
    if (categories.length == 1) {
      category = `${categories[0]}`;
    } else {
      category = `${categories[0]}-${categories[2]}`;
    }
    res.render("courses/show", { coursed, category });
  })
);

// router.get(
//   "/:id/edit",
//   isloggedin,
//   isCreator,
//   wrapAsync(async (req, res) => {
//     const { id } = req.params;
//     const cte = await Course.findById(id);
//     console.log(cte);
//     res.redirect("/");
//     // res.render("courses/edit", { cte });
//   })
// );

// router.post("/", isloggedin, upload.array('image'), validateCourse, wrapAsync(async (req, res) => {
//   const course = new Course(req.body.course);
//   course.images = req.files.map( f=> ({url:f.path, filename: f.filename}));
//   course.creator = req.user._id;
//   await course.save();
//   req.flash('success','Successfully submitted a new course');
//   res.redirect(`courses/${course._id}`);
// }));

router.post(
  "/",
  isloggedin,
  wrapAsync(async (req, res) => {
    let { courseurl } = req.body;
    courseurl = courseurl.split("\r\n");
    courseurl = courseurl.filter((url) => url.length > 0);
    let response = [];
    for (url of courseurl) {
      const keywords = url.split("/");
      if (keywords.length < 5 || keywords[2] !== "www.udemy.com") {
        response.push([
          "Not Valid Please enter a valid Udemy Course Link",
          null,
        ]);
        continue;
      } else if (
        (keywords.length < 6 || keywords[5] === "") &&
        (!req.user || req.user._id !== "61f8c954c4c3ec2f24215672")
      ) {
        response.push(["No coupon code", null]);
        continue;
      } else {
        let isPresent = await Course.findById(keywords[4]);
        if (isPresent) {
          if (isPresent["coupon"] === url) {
            response.push([
              "This Coupon Code is Old",
              `/courses/${keywords[4]}`,
            ]);
            continue;
          }
        }
        const newCourse = await scrap(url);
        if (!newCourse) {
          response.push("Failed to add course", null);
          continue;
        }
        if (
          newCourse["price"] !== "Free" &&
          req.user._id !== "61f8c954c4c3ec2f24215672"
        ) {
          response.push(["This coupon is not 100% Free", null]);
          continue;
        }

        if (isPresent) {
          const cupdated = await Course.findByIdAndUpdate(
            keywords[4],
            newCourse
          );
          await cupdated.save();
          response.push(["Succesfully Updated", `/courses/${keywords[4]}`]);
          continue;
        }
        newCourse["creator"] = req.user._id;
        newCourse["_id"] = keywords[4];
        const course = new Course(newCourse);
        await course.save();
        response.push([
          "Succesfully added a new course",
          `/courses/${keywords[4]}`,
        ]);
      }
    }
    res.render("courses/submit", { response });
  })
);

// router.put(
//   "/:id",
//   isloggedin,
//   isCreator,
//   // validateCourse,
//   wrapAsync(async (req, res) => {
//     const { id } = req.params;
//     const Cedited = await Course.findByIdAndUpdate(id, { ...req.body.course });
//     await Cedited.save();
//     req.flash("success", "Successfully updated!");
//     res.redirect(`/courses/${id}`);
//   })
// );

router.delete(
  "/:id",
  isloggedin,
  isCreator,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    req.flash("success", "Course deleted");
    res.redirect("/courses");
  })
);

module.exports = router;
