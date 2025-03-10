const express = require('express');
const userRouter = express.Router();
const {signup} = require("../controller/authController.js");


userRouter.post("/signup",signup);

module.exports = userRouter;