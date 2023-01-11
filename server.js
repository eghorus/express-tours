const mongoose = require("mongoose");

/* Handle synchronous uncaughtException errors */
/* This event should be registered before any other code */
process.on("uncaughtException", function (err) {
  console.log("🛑 uncaughtException:\n", err);
  process.exit(1);
});

if (process.env.NODE_ENV !== "production") require("dotenv").config();
const app = require("./app");

mongoose.set("strictQuery", false);

const mongodbConnUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}?${process.env.MONGODB_OPTIONS}`;

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(mongodbConnUri);
    console.log(`Connected to ${connection.connections[0].name} database.`);
  } catch (error) {
    /* This error is occurred outside the express application so it can be handled here or by the unhandledRejection handler */
    console.log("🛑 Error connecting to database.", "\n", error);
    server.close(() => process.exit(1));
  }
};

connectToDb();

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started and listening on port ${process.env.PORT}.`)
);

/* Handle asynchronous unhandledRejection errors */
process.on("unhandledRejection", function (err) {
  console.log("🛑 unhandledRejection:\n", err);
  server.close(() => process.exit(1));
});
