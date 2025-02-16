const express = require("express");
const routes = express.Router();
const { homeRoute } = require("../controller/app.controller");
// const { validationSchema } = require("../validation/schema");
const {
  createUser,
  getUsers,
  loginUser,
} = require("../controller/user.controller");
// const { runValidation } = require("../validation/validate");

routes.get("/", homeRoute);
routes.get("/users", getUsers);
routes.post(
  "/users",
  // runValidation(validationSchema.userRegestrationSchema),
  createUser
);
routes.post(
  "/login",
  // runValidation(validationSchema.userLoginSchema),
  loginUser
);

module.exports = routes;
