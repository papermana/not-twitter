const express = require('express');
const {
  ObjectId,
} = require('mongodb');

module.exports = ({db}) => {
  const router = new express.Router();

  router.delete('/messages/:messageId', (req, res) => {
    new Promise((resolve) => {
      if (!req.user) {
        throw new Error(`No user is logged in`);
      }
      else {
        resolve();
      }
    })
    .then(() => {
      return db.collection('messages')
      .findOne({_id: new ObjectId(req.params.messageId)});
    })
    .then(messageData => {
      if (!messageData) {
        throw new Error(`No message with given id`);
      }
      else if (messageData.author !== req.user.username) {
        throw new Error(`User is not the same as the message's author`);
      }
      else {
        db.collection('messages')
        .remove(messageData)
        .then(() => {
          res.redirect('/');
        });
      }
    })
    .catch(() => {
      res.redirect('/');
    });
  });

  return router;
};
