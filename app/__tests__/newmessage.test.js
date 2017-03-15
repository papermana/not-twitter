const express = require('express');
const bodyParser = require('body-parser');
const {
  MongoClient,
} = require('mongodb');
const request = require('supertest');
const newmessage = require('../newmessage');
const consts = require('../constants.js');

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = ({username} = {}) => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = newmessage({db});
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use((req, res, next) => {
      req.user = username && {username};
      next();
    });
    app.use('/', router);

    return {
      app,
      db,
    };
  })
);
const mockMessages = (messages) => {
  return ({app, db}) => (
    db.collection('messages')
    .insert(messages)
    .then(() => ({app, db}))
  );
};
const doRequest = (app) => {
  return request(app)
  .post('/newmessage')
  .type('form');
};
const getMessages = (db, author) => {
  return db.collection('messages')
  .find(author && {author})
  .toArray();
};

describe(`/newmessage`, () => {
  test(`Redirects to '/' if the user is not logged in`, () => {
    const originalMessages = [
      {author: 'foo', body: 'body1'},
      {author: 'bar', body: 'body2'},
    ];

    return getEnv()
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app)
      .send({author: 'foo', body: 'body3'})
      .then((response) => {
        expect(response.header.location).toBe('/');

        return getMessages(db)
        .then((messages) => {
          expect(messages).toEqual(originalMessages);
        });
      });
    });
  });

  test(`Creates a new message for a given user, and redirects to '/' if user credentials are correct`, () => {
    const originalMessages = [
      {author: 'foo', body: 'body1'},
      {author: 'bar', body: 'body2'},
    ];
    const newMessage = {author: 'foo', body: 'body3'};

    return getEnv({username: 'foo'})
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app)
      .send(newMessage)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return getMessages(db)
        .then((messages) => {
          expect(messages.slice(0, -1)).toEqual(originalMessages);
          expect(messages.slice(-1)).toEqual([{
            _id: expect.anything(),
            author: newMessage.author,
            body: newMessage.body,
          }]);
        });
      });
    });
  });
});
