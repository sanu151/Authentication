const express = require("express");
const userModel = require("./config/database");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
require("./config/passport");

const flash = require("connect-flash");

// Add this after session middleware
app.use(flash());

const session = require("express-session");
const MongoStore = require("connect-mongo");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/userAuthDB",
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware/route handler
  }
  res.redirect("/login"); // User is not authenticated, redirect to login page
};

app.use(passport.initialize());
app.use(passport.session());

// Make flash messages available in views
app.use((req, res, next) => {
  res.locals.error = req.flash("error"); // Pass error messages to views
  next();
});

// home get
app.get("/", (req, res) => {
  res.render("home");
});

// register get
app.get("/register", (req, res) => {
  res.render("register");
});

// login get
app.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

// login post
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "profile",
    failureRedirect: "login",
    failureFlash: true,
  })
);

// profile get
app.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { user: req.user }); // Pass the authenticated user to the view
});

// logout get
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Session destruction failed", error: err });
      }
      res.redirect("/"); // Redirect to home page after logout
    });
  });
});

// register post
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, saltRounds, async function (err, hash) {
    // Store hash in your password DB.
    const newUser = new userModel({
      name: name,
      email: email,
      password: hash,
    });
    const saveUser = await newUser.save();
    res.render("login");
  });
});

module.exports = app;
