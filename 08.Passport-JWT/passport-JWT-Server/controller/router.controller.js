require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../model/user.model");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

// Home : get
const homeRoute = (req, res) => {
  res.send("<h1>Welcome to Home Page</h1>");
};

// Register : post
const registerRoute = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      res.status(400).send("User already exist");
    }

    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username: req.body.username,
        password: hash,
      });
      await newUser.save().then((user) => {
        res.send({
          success: true,
          message: "User Created Successfully",
          user: {
            id: user._id,
            username: user.username,
          },
        });
      });
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Login : post
const loginRoute = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).send({
        status: falsse,
        message: "User not found",
      });
    }

    if (!bcrypt.compare(req.body.password, user.password)) {
      return res.status(401).send({
        status: falsse,
        message: "Incorrect Password",
      });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "2d",
    });
    res.send({
      success: true,
      message: `User Loggedin Successfully`,
      token: "Bearer " + token,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Profile : get
const profileRoute = (req, res) => {
  return res.status(200).send({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
    },
  });
};

module.exports = {
  homeRoute,
  registerRoute,
  loginRoute,
  profileRoute,
};
