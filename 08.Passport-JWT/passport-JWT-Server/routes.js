const express = require("express");
const {
  homeRoute,
  profileRoute,
  registerRoute,
  loginRoute,
} = require("./controller/router.controller");
const passport = require("passport");
const router = express.Router();

const auth = passport.authenticate("jwt", { session: false });

// get routes
router.get("/", homeRoute);
router.get("/profile", auth, profileRoute);

// post route
router.post("/register", registerRoute);
router.post("/login", loginRoute);

module.exports = router;
