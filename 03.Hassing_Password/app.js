const express = require("express");
const cors = require("cors");
const { routeError, serverError } = require("./controller/app.controller");
const router = require("./routes/app.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(routeError);
app.use(serverError);

module.exports = app;
