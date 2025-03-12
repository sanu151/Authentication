const express = require("express");
const cors = require("cors");
const router = require("./routes");
const passport = require("passport");
const { profileRoute } = require("./controller/router.controller");
const app = express();
require("./config/database");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

require("./config/passport");

app.use(router);
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  profileRoute
  // function (req, res) {
  //   return res.status(200).send({
  //     success: true,
  //     user: {
  //       id: req.user._id,
  //       username: req.user.username,
  //     },
  //   });
  // }
);

app.use((req, res, next) => {
  console.log("Incoming Request Headers:", req.headers);
  next();
});

//resource not found
app.use((req, res, next) => {
  res.status(404).json({
    message: "route not found",
  });
});

//server error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
