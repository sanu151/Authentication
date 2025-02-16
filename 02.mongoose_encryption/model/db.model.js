const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
require("dotenv").config();

const dbSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add Entryption Plugin
var encKey = process.env.ENC_KEY;
dbSchema.plugin(encrypt, {
  secret: encKey,
  encryptedFields: ["password"],
});

const Users = mongoose.model("users", dbSchema);

module.exports = Users;
