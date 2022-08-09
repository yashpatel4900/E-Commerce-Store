const cookieToken = async (user, res) => {
  const token = await user.getJwtToken();

  const option = {
    expiresIn: new Date(Date.now() + process.env.COOKIE_TIME),
    httpOnly: true,
  };

  // For not sending encrypted password as JSON output
  user.password = undefined;
  res.status(200).cookie("token", token, option).json({
    success: true,
    token,
    user,
  });
};

module.exports = cookieToken;
