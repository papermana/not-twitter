const passport = require('passport');
const PassportLocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  passport.use(new PassportLocalStrategy((username, password, done) => {
    db.collection('users')
    .findOne({username})
    .then(user => {
      if (!user) {
        return done(null, false, {message: 'Incorrect username'});
      }

      return bcrypt.compare(password, user.password)
      .then((isSame, err) => {
        if (err) {
          return done(err);
        }
        else if (!isSame) {
          return done(null, false, {message: 'Incorrect password'});
        }
        else {
          return done(null, user);
        }
      });
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    db.collection('users')
    .findOne({username})
    .then((userData, err) => done(err, userData));
  });

  return passport;
};
