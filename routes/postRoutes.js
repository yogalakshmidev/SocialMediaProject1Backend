const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");
const { createPost, getAllPost, getUserPosts, saveOrUnsavePost, deletePost, likeOrDislikePost, addComment } = require("../controller/postController");

const postRoutes = express.Router();
// Protected routes
postRoutes.post("/create-post",isAuthenticated,upload.single('image'),createPost);
postRoutes.post("/save-unsave-post/:postId",isAuthenticated,saveOrUnsavePost);
postRoutes.delete("/delete-post/:id", isAuthenticated, deletePost);
postRoutes.post("/like-dislike/:id", isAuthenticated, likeOrDislikePost);
postRoutes.post("/comment/:id", isAuthenticated,addComment);


// Unprotected routes
postRoutes.get("/all-post",getAllPost);
postRoutes.get("/user-post/:id",getUserPosts);




module.exports = postRoutes;
