const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/userAuthDB")
  .then(() => {
    console.log(`MongoDB connected successfully`);
  })
  .catch((err) => {
    console.log(`MongoDB connection error: ${err}`);
  });

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Users = mongoose.model("user", userSchema);

module.exports = Users;
