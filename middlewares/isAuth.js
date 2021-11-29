const jwt = require("jsonwebtoken");
const Users = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsync");

//checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    next(new ErrorHandler("Login first to access this resource", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await Users.findById(decoded.id);

  next();
});

// exports.protect = catchAsync(async (req, res, next) => {
//   try {
//     // 1) Getting token and check of it's there
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies.token) {
//       console.log("token:", token);
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return next(
//         new ErrorHandler(
//           "You are not logged in! Please log in to get access.",
//           401
//         )
//       );
//     }

//     // 2) Verification token
//     const decoded = await jwt.verify(token, process.env.JWT_SECRET);

//     // 3) Check if user still exists
//     const currentUser = await Users.findById(decoded.id);
//     if (!currentUser) {
//       return res.status(401).json({
//         success: false,
//         message: "User does not exist with this account.",
//       });
//     }

//     // 4) Check if user changed password after the token was issued
//     // if (currentUser.changedPasswordAfter(decoded.iat)) {
//     //   return next(
//     //     new AppError("User recently changed password! Please log in again.", 401)
//     //   );
//     // }

//     // GRANT ACCESS TO PROTECTED ROUTE
//     req.user = currentUser;
//     // res.locals.user = currentUser;
//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       success: false,
//       message: "Random error occured.",
//     });
//   }
// });
