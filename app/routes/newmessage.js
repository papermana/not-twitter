const express = require('express');

module.exports = ({db}) => {
  const router = new express.Router();

  router.post('/newmessage', (req, res) => {
    if (
      !req.user ||
      req.body.body.length > 140
    ) {
      res.redirect('/');
    }
    else {
      db.collection('messages')
      .insert({
        author: req.user.username,
        body: req.body.body,
      })
      .then(() => {
        res.redirect('/');
      });
    }
  });

  return router;
};
