if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.set("strictQuery", false);

const mongodbConnUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}?${process.env.MONGODB_OPTIONS}`;

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(mongodbConnUri);
    console.log(`Connected to ${connection.connections[0].name} database.`);
  } catch (error) {
    console.log("Error connecting to database.", "\n", error);
  }
};

connectToDb();

app.listen(process.env.PORT, () => console.log(`Server started and listening on port ${process.env.PORT}.`));
