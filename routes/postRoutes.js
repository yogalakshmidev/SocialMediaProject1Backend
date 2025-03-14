const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");
const { createPost } = require("../controller/postController");

const postRoutes = express.Router();

postRoutes.post("/create-post",isAuthenticated,upload.single('image'),createPost);





module.exports = postRoutes;
