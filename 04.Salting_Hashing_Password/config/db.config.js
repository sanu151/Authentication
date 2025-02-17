const { default: mongoose } = require("mongoose");
const config = require("./app.config");

const dburl = config.db.dbUrl;

mongoose
  .connect(dburl)
  .then(() => {
    console.log(`MongoDB Atlas is connected successfully`);
  })
  .catch((error) => {
    console.log(`Database connection error : ${error.message}`);
    process.exit(1);
  });
