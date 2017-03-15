const express = require('express');

module.exports = ({db}) => {
  const router = new express.Router();

  router.delete('/users/:username', (req, res) => {
    if (!req.user || !req.user.username === req.params.username) {
      res.redirect('/');
    }
    else {
      db.collection('users')
      .remove({username: req.params.username})
      .then(() => {
        res.redirect('/');
      });
    }
  });

  return router;
};
