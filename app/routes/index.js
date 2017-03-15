const express = require('express');
const pug = require('pug');

module.exports = ({db}) => {
  const router = new express.Router();

  router.get('/', (req, res) => {
    const userData = req.user || {};

    db.collection('messages')
    .find()
    .limit(20)
    .toArray()
    .then(messages => {
      const locals = {
        username: userData.username,
        signedIn: !!userData.username,
        messages,
      };
      const html = pug.renderFile('pages/index.pug', locals);

      res.send(html);
    });
  });

  return router;
};
