const express = require("express");
const cors = require("cors");
const router = require("./routes/routes");
const { routeError, serverError } = require("./controller/app.controller");
const app = express();
require("./config/db.config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(routeError);
app.use(serverError);

module.exports = app;
