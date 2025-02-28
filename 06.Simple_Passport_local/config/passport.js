const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("./database");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
          return done(null, false, req.flash("error", "Invalid email"));
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
          return done(null, false, req.flash("error", "Invalid password"));
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
