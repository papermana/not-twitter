const express = require('express');

module.exports = () => {
  const router = new express.Router();

  router.get('/messages', (req, res) => {
    res.redirect('/');
  });

  return router;
};
