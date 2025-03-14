const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { uploadToCloudinary } = require("../utils/cloudinary");
const getDataUri = require("../utils/datauri");

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select(
      "-password  -confirmPassword -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires"
    )
    .populate({
      path: "post",
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return next(new AppError("User email id not found", 404));
  }

  res.status(200).json({ status: "success", data: { user } });
});

// Edit profile
exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const { bio } = req.body;
  const profilePicture = req.file;

  let cloudResponse;

  if (profilePicture) {
    const fileuri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileuri);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("Email id / user not found", 404));

  if (bio) user.bio = bio;

  if (profilePicture) user.profilePicture = cloudResponse.secure_url;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ message: "Profile Updated ", status: "success", data: { user } });
});

// suggested user
exports.suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;

  const user = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -confirmPassword -otp -OtpExpires -resetPasswordOTP -resetPasswordOTPExpires"
  );

  res.status(200).json({
    status: "success",
    message: "suggested users shown",
    data: { user },
  });
});

// Follow unFollow
exports.followUnfollow = catchAsync(async (req, res, next) => {
  const loginUserId = req.user._id;
  const targetUserId = req.params.id;
  console.log(
    "login user id and target user id are",
    loginUserId,
    "and",
    targetUserId
  );
  if (loginUserId.toString() === targetUserId) {
    return next(new AppError("You cannot follow/unfollow yourself", 400));
  }
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  const isFollowing = targetUser.followers.includes(loginUserId);
  console.log("isFollowing value is", isFollowing);

  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUser },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedInUser = await User.findById(loginUserId).select(
    "-password"
  );

  res.status(200).json({
    message: isFollowing ? "Unfollowed Successfully" : "Followed Successfully",
    status: "success",
    data: {
      user: updatedLoggedInUser,
    },
  });
});

// My Profile Details
exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Authenticated user",
    data: {
      user,
    },
  });
});
