const Joi = require("joi");
module.exports.courseSchema = Joi.object({
  course: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    students: Joi.string().required(),
    coupon: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
  }).required(),
});
