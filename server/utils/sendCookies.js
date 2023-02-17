const sendCookies = async (user, statusCode, res) => {
  const token = await user.getToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY_DATE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    
  };


  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message:'Passed the cookies successfully',
    token,
    user,
  });
};

module.exports = sendCookies;
