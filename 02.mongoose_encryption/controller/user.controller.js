const Users = require("../model/db.model");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new Users({
      name,
      email,
      password,
    });
    const saveUser = await newUser.save();
    res.status(201).json({
      message: "User Created Successfully",
      saveUser,
    });
  } catch (error) {
    res.status(404).send(`Error! Something is missing`);
    process.exit(1);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const allUsers = await Users.find();
    res.status(200).json({
      listUsers: "List of All Users",
      allUsers,
    });
  } catch (error) {
    res.status(404).send(`Error! Something is missing`);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentUser = await Users.findOne({ email: email });
    if (currentUser && password === password) {
      res.status(201).json({
        message1: "User Login Successfull",
        currentUser,
      });
    }
  } catch (error) {
    res.status(404).send(`Error! Something is missing`);
  }
};
