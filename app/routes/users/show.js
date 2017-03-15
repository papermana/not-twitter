const express = require('express');
const pug = require('pug');

module.exports = ({db}) => {
  const router = new express.Router();

  router.get('/users/:username', (req, res) => {
    db.collection('users')
    .findOne({username: req.params.username})
    .then(userData => {
      if (!userData) {
        throw new Error(`Couldn't find userData`);
      }
      else {
        const messages = db.collection('messages')
        .find({author: userData.username})
        .limit(20)
        .toArray();

        return Promise.all([userData, messages]);
      }
    })
    .then(([user, messages]) => {
      const locals = {
        username: user.username,
        messages,
      };
      const html = pug.renderFile('pages/users/show.pug', locals);

      res.send(html);
    })
    .catch(() => {
      res.redirect('/');
    });
  });

  return router;
};
