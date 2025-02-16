const md5 = require("md5");
const Users = require("../model/db.model");

const createUser = async (req, res) => {
  try {
    const newUser = new Users({
      name: req.body.name,
      email: req.body.email,
      password: md5(req.body.password),
    });
    const saveUser = await newUser.save();
    res.status(201).json({
      status: 201,
      message: "User is Created",
      saveUser,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "User not Created",
      error,
    });
    process.exit(1);
  }
};

const getUsers = async (req, res) => {
  try {
    const allUsers = await Users.find();
    const UsersData = allUsers.map((user) => `${user.name} : ${user.email}`);
    res.status(200).json({
      status: 200,
      Message: "Users List",
      UsersData,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Error to get User Data",
      error,
    });
    process.exit(1);
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = md5(req.body.password);
    const currentUser = await Users.findOne({ email: email });
    if (currentUser && currentUser.password === password) {
      const user = `Welcome ${currentUser.name}`;
      res.status(200).json({
        status: 200,
        message: "User is Logged in",
        user,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "User Name or Password Missmatch",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Login Unsuccessful.",
      error,
    });
    process.exit(1);
  }
};

module.exports = { createUser, getUsers, loginUser };
