const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is missing"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
