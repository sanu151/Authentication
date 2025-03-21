require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connceted");
  })
  .catch((error) => {
    console.log(error);
  });
