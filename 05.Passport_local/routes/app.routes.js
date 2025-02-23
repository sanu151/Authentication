const express = require("express");
const {
  homeRoute,
  registerRoute,
  loginRoute,
  profileRoute,
  logoutRoute,
} = require("../controller/app.controller");
const { createUser, loginUser } = require("../controller/user.controller");
const runValidation = require("../validation/validate");
const userValidationSchema = require("../validation/schema");
const router = express.Router();
require("../auth/passport");

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.get("/", homeRoute);
router.get("/register", registerRoute);
router.get("/login", loginRoute);
router.get("/profile", ensureAuthenticated, profileRoute);
router.get("/logout", logoutRoute);

router.post(
  "/register",
  runValidation(userValidationSchema.userRegistrationSchema),
  createUser
);
router.post(
  "/login",
  runValidation(userValidationSchema.userLoginSchema),
  loginUser
);

module.exports = router;
