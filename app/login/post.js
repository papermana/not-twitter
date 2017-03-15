const express = require('express');

module.exports = ({passport}) => {
  const router = new express.Router();

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }));

  return router;
};
