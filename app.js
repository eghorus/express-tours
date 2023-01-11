const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const usersRouter = require("./routers/users.router");
const toursRouter = require("./routers/tours.router");
const OpError = require("./helpers/operational-error");
const globalErrorHandler = require("./helpers/middlewares/global-error-handler");
const sanitizeMongoQuery = require("./helpers/middlewares/sanitize-mongo-queries");

const app = express();
app.use(helmet());
const limiter = rateLimit({
  windowMS: 60 * 60 * 1000,
  max: 500,
  message: "Too many requests made from this IP address, please try again after one hour.",
  standardHeaders: true,
});
app.use("/api", limiter);
app.use(express.json({ limit: "2MB" }));
app.use(sanitizeMongoQuery);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/tours", toursRouter);
app.use((req, res, next) => next(new OpError(404, `Can't ${req.method} on ${req.originalUrl}.`)));
app.use(globalErrorHandler);

module.exports = app;
