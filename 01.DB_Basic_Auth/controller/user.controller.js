const path = require("path");
const Users = require("../model/db.model");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new Users({
      name,
      email,
      password,
    });
    const saveUser = await newUser.save();
    res.status(201).sendFile(path.join(__dirname, "../view/login.html"));
  } catch (error) {
    res.status(504).json({
      message: error.message,
    });
  }
};

const loginUser = (req, res) => {
  res.status(201).sendFile(path.join(__dirname, "../view/login.html"));
};

const readUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email });
    if (user && password === password) {
      res.status(200).sendFile(path.join(__dirname, "../view/welcome.html"));
    }
  } catch (error) {
    res.status(504).json({
      message: error.message,
    });
  }
};

module.exports = { createUser, readUser, loginUser };
