const express = require("express");
const userRouter = express.Router();

const {
  signup,
  verifyAccount,
  resendOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controller/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const {
  getProfile,
  editProfile,
  suggestedUser,
  followUnfollow,
  getMe,
} = require("../controller/userController");

const upload = require("../middleware/multer");

// Unprotected routes in Authorization
userRouter.post("/signup", signup);
userRouter.post("/logout", logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Protected routes in Authorization
userRouter.post("/verify", isAuthenticated, verifyAccount);
userRouter.post("/resend-otp", isAuthenticated, resendOtp);
userRouter.post("/login", isAuthenticated, login);

userRouter.post("/change-password", isAuthenticated, changePassword);

// User Routes
userRouter.get("/profile/:id", getProfile);
userRouter.post(
  "/edit-profile",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);

userRouter.get("/suggested-user", isAuthenticated, suggestedUser);
userRouter.post("/follow-unfollow/:id", isAuthenticated, followUnfollow);
userRouter.post("/me", isAuthenticated, getMe);

module.exports = userRouter;
