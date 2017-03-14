const express = require('express');

const router = new express.Router();

module.exports = () => {
  router.get('/users', (req, res) => {
    res.redirect('/');
  });

  return router;
};
