const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../app/models/User");

module.exports = function (passport) {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });

  // SIGNUP STRATEGY
  passport.use("local-signup", new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      const exists = await User.findOne({ email });
      if (exists)
        return done(null, false, req.flash("signupMessage", "Email already taken"));

      const user = new User({
        name: req.body.name,
        email,
        password: bcrypt.hashSync(password, 10)
      });

      await user.save();
      return done(null, user);
    }
  ));

  // LOGIN STRATEGY
  passport.use("local-login", new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      const user = await User.findOne({ email });
      if (!user)
        return done(null, false, req.flash("loginMessage", "No user found"));

      if (!bcrypt.compareSync(password, user.password))
        return done(null, false, req.flash("loginMessage", "Wrong password"));

      return done(null, user);
    }
  ));
};

//Citations:
//Modified code from youtube tutorial: https://www.youtube.com/watch?v=z5UgtXOxEEk
//Reference code from https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial#setting-up-the-project
//Use of dotenv package to hide sensitive info: https://www.npmjs.com/package/dotenv
//Use of Learning Mode on AI tools to help with code structure,syntax and debugging  
