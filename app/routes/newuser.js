const express = require('express');
const bcrypt = require('bcryptjs');
const validatePassword = require('../validatePassword');

const router = new express.Router();

module.exports = ({db}) => {
  router.post('/newuser', (req, res, next) => {
    if (
      !req.body ||
      !req.body.username ||
      !req.body.password ||
      !validatePassword(req.body.password)
    ) {
      res.redirect('/signup');

      return;
    }

    bcrypt.hash(req.body.password, 10)
    .then((hash, err) => {
      if (err) {
        return next(err);
      }

      const userObject = {
        username: req.body.username,
        password: hash,
      };

      return db.collection('users')
      .insert(userObject)
      .then(() => {
        req.login(userObject, loginErr => {
          if (loginErr) {
            return next(loginErr);
          }
          else {
            return res.redirect('/');
          }
        });
      });
    });
  });

  return router;
};
