const express = require('express');

module.exports = () => {
  const router = new express.Router();

  router.get('/messages/:messageId', (req, res) => {
    res.redirect('/');
  });

  return router;
};
