const express = require("express");
const cors = require("cors");
const ejs = require("ejs");
const router = require("./routes/app.routes");
const { routeError, serverError } = require("./controller/app.controller");
const app = express();
require("./config/db.config");
const path = require("path");
const config = require("./config/app.config");
const flash = require("connect-flash");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport Authentication
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.db.dbUrl,
      collectionName: "sessions",
    }),
    // cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .render("error", { err: 500, message: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).render("error", { err: 404, message: "Page not found" });
});

module.exports = app;
