require("dotenv").config();
const passport = require("passport");
const User = require("../config/database");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // if not a user, create a user with google id
          let newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
          });
          await newUser.save();
          return cb(null, newUser);
        } else {
          // if user found, return user
          return cb(null, user);
        }
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
