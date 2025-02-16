const mongoose = require("mongoose");
const config = require("./app.config");

const dbUrl = config.db.dbUrl;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log(`MongoDB Atlas is connected`);
  })
  .catch((error) => {
    console.log(`MongoDB Atlas is not connected. Error: ${error.messase}`);
    process.exit(1);
  });
