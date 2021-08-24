const Joi  = require("joi");
module.exports.courseSchema = Joi.object({
    course: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        coupon: Joi.string().required()

    }).required()
  });

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        // rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})