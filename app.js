const express = require("express");
const morgan = require("morgan");
// For security
const helmet = require("helmet");

const cors = require("cors");

const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controller/errorController.js");

const userRouter = require("./routes/userRoutes.js");

const postRouter = require("./routes/postRoutes.js");

const app = express();

// Add middlewares
app.use("/", express.static("uploads"));

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: [`https://localhost/3000`],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));
if (process.env.MODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

// Routes for Users
app.use("/api/v1/users", userRouter);

// Routes for posts
app.use("api/v1/posts", postRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
