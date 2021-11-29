//create and send token in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  console.log("got token", user);

  const options = {
    expiresIn: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};
module.exports = sendToken;
