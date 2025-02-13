const express = require("express");
const { homeRoute } = require("../controller/app.controller");
const { runValidation } = require("../validation/validate");
const { validationSchema } = require("../validation/schema");
const {
  createUser,
  readUser,
  loginUser,
} = require("../controller/user.controller");
const router = express.Router();

router.get("/", homeRoute);
router.post(
  "/register",
  runValidation(validationSchema.userRegistrationSchema),
  createUser
);

router.get("/login", loginUser);

router.post(
  "/login",
  runValidation(validationSchema.userLoginSchema),
  readUser
);

module.exports = router;
