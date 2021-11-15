const jwt = require("jsonwebtoken");
const Users = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

module.exports = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      next(new ErrorHandler("Login first to access this resource", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Users.findById(decoded.id);

    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      error: "Not authorized for this route",
    });
  }
};
