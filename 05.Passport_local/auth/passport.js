const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("../model/user.model");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // Pass the request object to the callback
    },
    async (req, email, password, done) => {
      try {
        const user = await Users.findOne({ email: email });
        if (!user) {
          return done(null, false, req.flash("error", "Invalid email"));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, req.flash("error", "Invalid password"));
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
