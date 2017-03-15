const express = require('express');

module.exports = () => {
  const router = new express.Router();

  router.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  return router;
};
