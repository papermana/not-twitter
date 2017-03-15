const express = require('express');
const pug = require('pug');

module.exports = () => {
  const router = new express.Router();

  router.get('/signup', (req, res) => {
    const userData = req.user || {};
    const locals = {
      username: userData.username,
      signedIn: !!userData.username,
    };
    const html = pug.renderFile(`pages/signup.pug`, locals);

    res.send(html);
  });

  return router;
};
