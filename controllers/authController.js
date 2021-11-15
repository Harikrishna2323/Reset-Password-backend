const catchAsync = require("../middlewares/catchAsync");
const Users = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await Users.create({
      name,
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "User created successfully.",
      user,
    });
  } catch (error) {
    console, log(error);
    return res.status(400).json({
      success: false,
      message: "Error creating user. Please try again later.",
    });
  }
};

//login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Plase provide email and password",
    });
  }
  const user = await Users.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
  const isMatchingPassword = await user.comparePassword(password);
  if (!isMatchingPassword) {
    return res.status(404).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token, { httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Log in Successful.",
    user,
    token,
  });
});

exports.protected = catchAsync(async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    success: true,
    message: "You are authorized.",
    user: req.user,
  });
});

//forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //find the user
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("There is no user with that email.", 404));
  }

  //generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to users email
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Forgot your password? Click here: \n ${resetUrl}\n\nIf you didnt, please ignore this mail.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset (Valid for 10 mins).",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent to mail.",
    });
  } catch (error) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler("There was an error sending mail. Try again later.", 500)
    );
  }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  //   console.log("resetToken: ", resetToken);
  //get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await Users.findOne({
    passwordResettoken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //set new password , if token has not expired.
  if (!user) {
    return next(new ErrorHandler("Token has expired or is invalid.", 400));
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //log the user in
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(200).json({
    success: true,
    message: "Password reset Successful.",
    token,
  });
});

//get current user
exports.getUserProfile = catchAsync(async (req, res, next) => {
  // console.log("req.user:", req.user);

  const user = await Users.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//update current user
exports.updateProfile = catchAsync(async (req, res, next) => {
  // console.log("req.user:", req.user);
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await Users.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // console.log("Modified user:", user);
  res.status(200).json({
    success: true,
    user,
  });
});

//logout user
exports.logoutUser = catchAsync(async (req, res, next) => {
  req.user = undefined;
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out!",
  });
});
