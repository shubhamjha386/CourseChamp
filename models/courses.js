const { string } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; //creating a reference for shortchut

const CourseSchema = new Schema({
  _id: String,
  title: String,
  headline: String,
  price: String,
  image: String,
  coupon: String,
  category: String,
  rating: String,
  expiry: String,
  instructor: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
},{ _id: false });

CourseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Course", CourseSchema);
