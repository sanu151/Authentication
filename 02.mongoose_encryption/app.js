const express = require("express");
const cors = require("cors");
const { routeError, serverError } = require("./controller/app.controller");
const app = express();
const userRouter = require("./routes/app.routes");
require("./config/db.config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);

app.use(routeError);
// app.use(serverError);

module.exports = app;
