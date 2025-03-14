const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const hbs = require("hbs");
const { title } = require("process");
const sendEmail = require("../utils/email");

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, "../emailTemplate", templateName);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = hbs.compile(source);
  return template(replacements);
};

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
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  user.otp = undefined;
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
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

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Otp Verification",
    username: newUser.username,
    otp,
    message: "Your one-time password (OTP) for account verification is:",
  });

  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for Email Verification",
      html: htmlTemplate,
    });

    createSendToken(
      newUser,
      200,
      res,
      "Registration Successful. Check your email for otp verification"
    );
  } catch (error) {
    await User.findByIdAndDelete(newUser.id);
    return next(
      new AppError(
        "There is an error in creating the account. Please try again later",
        500
      )
    );
  }
});
// Used to verify the account
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError("Otp is required for verification", 400));
  }
  const user = req.user;

  if (user.otp !== otp) {
    return next(new AppError("Invalid Otp", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(new AppError("Otp Expired. Please request new OTP", 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, "Email has been verified");
});

// Resent Otp
exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email id is not found", 400));
  }

  if (user.isVerified) {
    return next(new AppError("This account is already verified", 400));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Resend OTP verification",
    username: user.username,
    otp,
    message: "Your one-time password for Account Verification is",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend Otp for email verification",
      html: htmlTemplate,
    });
    res.status(200).json({
      status: "success",
      message: "A new otp is send to your email id",
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There is an error sending email. Try again later!", 500)
    );
  }
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res, "Login Successfully");
});

// Logged Out
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.MODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged Out Successfully.",
  });
});

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // To generate otp :
  const otp = generateOtp();
  // otp expires in 5 minutes
  const resetExpires = Date.now() + 300000;

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = resetExpires;

  await user.save({ validateBeforeSave: false });

  // to send email in a particular format
  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Reset Password OTP",
    username: user.username,
    otp,
    message: "Your password reset otp is",
  });
  try {
    await sendEmail({
      email:user.email,
      subject:"Password reset OTP(valid for 5 minutes",
      html:htmlTemplate,
    });
    res.status(200).json({status:"success",message:"Password reset otp is send to your email"})

  } catch (error) {
      
user.resetPasswordOTP= undefined;
user.resetPasswordOTPExpires= undefined;
await user.save({validateBeforeSave: false});
    return next(
      new AppError(
        "There is an error in  sending forgot password email. Try again later!",
        500
      )
    );
  }
});

// reset password
exports.resetPassword = catchAsync(async(req,res,next)=>{
  const {email,otp,password,confirmPassword}=req.body;
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires:{$gt:Date.now()},
  });
  if(!user){
    return next(new AppError("Email id not found",400));
  }

  user.password=  password;
  user.confirmPassword = confirmPassword;
  user.resetPasswordOTP= undefined;
  user.resetPasswordOTPExpires=undefined;

  await user.save();

createSendToken(user,200,res,"Password Reset Successfully");

});

// Change Password
exports.changePassword = catchAsync(async (req,res,next) => {
  const{currentPassword, newPassword, newConfirmPassword} = req.body;

  const {email}= req.user;
  console.log("the user details in the request is",req,"and the user name details is:",req.user);

  const user = await User.findOne({email}).select("+password");

  if(!user){
    return next(new AppError("Email id is not found",400) );
  }

  if(!(await user.correctPassword(currentPassword,user.password))){
    return next(new AppError("Incorrect current Password",400) );
  }
  
  if(newPassword != newConfirmPassword){
    return next(new AppError("New Password and confirm password are not same",400) );
  }

user.password= newPassword;
user.confirmPassword =  newConfirmPassword;

await user.save();

createSendToken(user,200,res,"Password Changed Successfully");

})