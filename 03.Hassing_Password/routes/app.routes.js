const express = require("express");
const { homeRoute } = require("../controller/app.controller");
const {
  getUsers,
  createUser,
  loginUser,
} = require("../controller/user.controller");
const runValidation = require("../validation/validate");
const validationSchema = require("../validation/schema");
const router = express.Router();

router.get("/", homeRoute);
router.get("/users", getUsers);
router.post(
  "/users",
  runValidation(validationSchema.userRegistrationSchema),
  createUser
);

router.post(
  "/login",
  runValidation(validationSchema.userLoginSchema),
  loginUser
);

module.exports = router;
