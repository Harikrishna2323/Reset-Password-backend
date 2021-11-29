const express = require("express");
const authController = require("../controllers/authController");
const middleware = require("../middlewares/isAuth");
const router = express.Router();

router.route("/register").post(authController.registerUser);

router.route("/login").post(authController.loginUser);

router.route("/logout").get(authController.logoutUser);

router.route("/password/forgot").post(authController.forgotPassword);

router.route("/password/reset/:resetToken").patch(authController.resetPassword);

router
  .route("/password/update")
  .patch(middleware.isAuthenticatedUser, authController.updatePassword);

router
  .route("/me")
  .get(middleware.isAuthenticatedUser, authController.getUserProfile);

router
  .route("/me/update")
  .patch(middleware.isAuthenticatedUser, authController.updateProfile);

module.exports = router;
