const mongoose = require("mongoose");
const config = require("./app.config");

const dbUrl = config.db.dbUrl;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log(`MongoDB Atlas is Connected`);
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
