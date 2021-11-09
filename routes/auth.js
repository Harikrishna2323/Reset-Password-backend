const express = require("express");
const authController = require("../controllers/authController");
const requireLogin = require("../middlewares/isAuth");
const router = express.Router();

router.route("/register").post(authController.register);

router.route("/login").post(authController.login);

router.route("/protected").get(requireLogin, authController.protected);

router.route("/password/forgot").post(authController.forgotPassword);

router.route("/password/reset/:resetToken").patch(authController.resetPassword);

module.exports = router;
