const jwt = require("jsonwebtoken");
const Users = require("../models/User");

module.exports = (req, res, next) => {
  // console.log(req.headers);
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      error: "You must be logged in.",
    });
  }
  const token = authorization.split(" ")[1];
  console.log(token);
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({
        error: "You must be logged in.",
      });
    }
    const { id } = payload;
    const user = await Users.findById(id);
    req.user = user;
  });
  next();
};
