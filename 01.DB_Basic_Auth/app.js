const express = require("express");
const cors = require("cors");
const app = express();
const appRouter = require("./router/app.routes");
const { errorRoute } = require("./controller/app.controller");
require("./config/db.config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(appRouter);

app.use(errorRoute);

module.exports = app;
