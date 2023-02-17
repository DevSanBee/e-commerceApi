const catchAsyncErrors = require("../middleWares/catchAsyncErrors");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const sendEmail = require("../utils/saveEmail");
const sendCookies = require("../utils/sendCookies");
const crypto = require("crypto");


// Controller for creating a new user ==> endpoint: /api/auth/register
exports.createUser = catchAsyncErrors(async function (req, res, next) {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "skfljsdfjsldf/sdfisdfiopsdf",
      url: "https://image/sdfisdfiopsdf.com",
    },
  });
  sendCookies(user, 201, res);
});

// Controller for Login user in ==> endpoint: /api/auth/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  // Check if user provids email and  password
  const { email, password } = await req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  // Check if the user details are already in the database
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Validate password provided by the user
  const checkPasswordMatch = await user.checkPassword(password);
  if (!checkPasswordMatch) {
    return next(new ErrorHandler("invalid email or password", 401));
  }
  const {token} = await req.cookies
  if (token){
    
    return next(new ErrorHandler('You are already logged in', 400))
  }
    sendCookies(user, 200, res);
});

// Log out the user ==> endpoint: /api/auth/logout
exports.logOutUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = await req.cookies;
  if (!token) {
    return next(
      new ErrorHandler("You need to log in first before logging out", 400)
    );
  }
 
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
// Update user password ==> endpoint: /api/auth/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user =await User.findById(req.user.id).select('+password')
  const isMatched = await user.checkPassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler('The old password is incorrect', 400))
  }
  user.password = req.body.newPassword
  await user.save()
  sendCookies(user, 200, res)
})

// Update user ==> endpoint: /api/me/update
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newProfile = {
    name: req.body.name,
    email: req.body.email
  }
  const user = await User.findByIdAndUpdate(req.user.id, newProfile, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  // if (!user) {
  //   return next(new ErrorHandler("User not found", 404));
  // }
  res.status(201).json({
    success: true,
    message: `User Updated successfully`,
    user
    });
});

// Forget Password  ==> endpoint: api/password/forgot
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorHandler("You need to provide a valid email address", 404)
    );
  }
  const resetPasswordToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetPasswordToken}`;
  const message = `Your password reset url is \n\n ${resetPasswordUrl}. \n\nPlease ignore this email if you did not request the password reset`;
  console.log(message);
  try {
    await sendEmail({
      email: user.email,
      subject: `LandIt Password Reset Email`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `The password reset email has been sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPassordExpires = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password  ==> endpoint: api/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Rehash Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken
  });

  if (!user) {
    return next(
      new ErrorHandler("Can't find user with the reset password token",
      404)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password does not match confirm password",
      403)
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPassordExpires = undefined;

  await user.save();
  sendCookies(user, 200, res);
});

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    user
  })
})


// #######################################  ADMIN ROUTES #####################################
// Controller for getting the available users ==> endpoint: /api/auth
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  if (!users.length) {
    return next(new ErrorHandler("Couldn't find users", 404));
  }
  res.status(200).json({
    success: true,
    users,
  });
});

// Getting the details of a user ==> endpoint: /api/admin/users/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler('Cannot find user ', 404))
  }
  res.status(200).json({
    success: true,
    user
  })
})

// Update user details ==> endpoint: api/admin/users/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const updateDetails = {
    name: req.body.name,
    email: req.body.email
  }
  const user = await User.findByIdAndUpdate(req.params.id, updateDetails, {
    new: true,
    runValidators: true,
    useFindAndModify:false,
  })

  res.status(200).json({
    success: true,
    user
  })
})

// Controller for deleting users in admin dashboard : endpoint: /api/admin/user /:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler('Cannot find user ', 404))
  }
  await user.remove()

  res.status(200).json({
    success: true,
    message: `User deleted successfully. Thanks`
  })
})