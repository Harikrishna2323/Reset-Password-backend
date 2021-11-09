const jwt = require("jsonwebtoken");
const Users = require("../models/User");

module.exports = async (req, res, next) => {
  // console.log(req.headers);
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      error: "You must be logged in.",
    });
  }
  const token = authorization.split(" ")[1];
  console.log(token);
  await jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({
        error: "You must be logged in.",
      });
    }
    // console.log(payload);
    const { id } = payload;
    const user = await Users.findById({ _id: id });

    req.locals = user;
    req.user = user;
    console.log(req.user);
  });
  next();
};
