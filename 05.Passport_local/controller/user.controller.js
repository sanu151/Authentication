const passport = require("passport");
const Users = require("../model/user.model");
require("../auth/passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const createUser = (req, res) => {
  try {
    const { name, email, password } = req.body;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      // Store hash in your password DB.
      const newUser = new Users({
        name: name,
        email: email,
        password: hash,
      });
      const saveUser = await newUser.save();
      res.redirect("login");
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "Invalid Input",
      error,
    });
  }
};

const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).render("login", {
        title: "Login Page",
        errors: "Internal server error",
      });
    }
    if (!user) {
      return res
        .status(401)
        .render("login", { title: "Login Page", errors: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .render("login", { title: "Login Page", errors: "Login failed" });
      }
      return res.redirect("/profile");
    });
  })(req, res, next);
};

module.exports = { createUser, loginUser };
