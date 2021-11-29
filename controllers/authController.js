const catchAsync = require("../middlewares/catchAsync");
const Users = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");

exports.registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  const user = await Users.create({
    name,
    email,
    password,
  });
  sendToken(user, 201, res);
});

//login user
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //checks if email and password is entered
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }
  const user = await Users.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  //cecks if password is correct
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

//forgot password route => /api/v1/password/forgot
exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log("Forgot password route");
  const user = await Users.findOne({ email: req.body.email });
  console.log("user found");

  if (!user) {
    return next(new ErrorHandler("User not Found with this email.", 404));
  }
  //get reset token
  const restToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${restToken}`;
  const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, please ignore it.`;
  console.log(message);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

//to reset password => /api/v1/password/reset:token
exports.resetPassword = catchAsync(async (req, res, next) => {
  //hash url token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Users.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Password reset token is Invalid or has expired.", 400)
    );
  }

  if (req.body.password != req.body.passwordConfirm) {
    return next(new ErrorHandler("Password does not match.", 400));
  }

  //setup new password
  user.password = req.body.password;
  user.reetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res);
});

//get curently logged in details => /api/v1/me
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await Users.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update password => /api/v1/password/update
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await Users.findById(req.user.id).select("+password");
  //check previous password

  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old Password is incorect.", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//update User profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await Users.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  console.log(newUserData);

  console.log(user);
  res.status(200).json({
    success: true,
  });
});

//logout user
exports.logoutUser = catchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out!",
  });
});
