const bcrypt = require("bcrypt");
const Users = require("../model/db.model");
const saltRounds = 10;

const createUser = (req, res) => {
  try {
    const { name, email, password } = req.body;
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      // Store hash in your password DB.
      const newUser = new Users({
        name: name,
        email: email,
        password: hash,
      });
      const saveUser = await newUser.save();
      res.status(201).json({
        status: 201,
        message: "User Registration Successful",
        saveUser,
      });
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Invalid Input",
      error,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const allUser = await Users.find();
    const usersList = allUser.map((user) => `${user.name} : ${user.email}`);
    res.status(200).json({
      status: 200,
      message: "Users List",
      usersList,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Invalid Input",
      error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const currnetUser = await Users.findOne({ email: email });
    if (currnetUser) {
      bcrypt.compare(password, currnetUser.password, function (err, result) {
        // result == false
        if (result === true) {
          res.status(200).json({
            status: 200,
            message: "User Login Successful",
          });
        }
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Not a Valid User",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Invalid Input",
      error,
    });
  }
};

module.exports = { createUser, getUser, loginUser };
