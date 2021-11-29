const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "UserName is mandatory"],
    minlength: [3, "UserName must have atleast 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
    unique: [true, "This email was already taken. Try another"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide valid Email",
    ],
    validate: [validator.isEmail, "Please enter valid email address."],
  },
  password: {
    type: String,
    required: [true, "Password is mandatory"],
    minlength: 6,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpire: Date,
  date: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

//compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//generate password reset tokeen
userSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //hash and set to reset Password token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set token expire timr
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

const Users = mongoose.model("User", userSchema);
module.exports = Users;
