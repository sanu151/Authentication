const config = require("./app.config");
const mongoose = require("mongoose");

const dbUrl = config.db.dbUrl;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log(`MongoDB Atals is Connected`);
  })
  .catch((error) => {
    console.log(error.message);
  });
