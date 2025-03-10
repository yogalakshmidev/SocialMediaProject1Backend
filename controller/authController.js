const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"? 'none': "Lax"
  };

  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  user.otp= undefined;
  res.status(statusCode).json({
    status:"success",
    message,
    token,
    data:{
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, username } = req.body;

  const existingUser = await User.findOne({ email });

  //  if there is an existing user
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;
  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword,
    otp,
    otpExpires,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
