const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already registered"],
  },
  username: {
    type: String,
    required: [true, "Username required"],
    unique: [true, "Username already exists"],
  },
  fullname: {
    type: String,
    required: [true,"Full name required"]
  },
  photo:String,
  source: { type: String, required: [true, "source not specified"] },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
