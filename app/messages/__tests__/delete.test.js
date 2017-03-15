const express = require('express');
const bodyParser = require('body-parser');
const {
  MongoClient,
  ObjectId,
} = require('mongodb');
const request = require('supertest');
const messagesDelete = require('../delete');
const consts = require('../../constants.js');

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = ({username} = {}) => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = messagesDelete({db});
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
const doRequest = (app, id = '00000000test') => {
  return request(app)
  .delete(`/messages/${id}`);
};
const findMessages = (db) => {
  return db.collection('messages')
  .find()
  .toArray();
};

describe(`/messages/:messageId DELETE`, () => {
  test(`Redirects to '/' if no user is logged in`, () => {
    const originalMessages = [{author: 'foo', body: 'body1'}];

    return getEnv()
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return findMessages(db)
        .then((messages) => {
          expect(messages).toEqual(originalMessages);
        });
      });
    });
  });

  test(`Redirects to '/' if logged user's name doesn't correspond to the message's author's username`, () => {
    const originalMessages = [{author: 'foo', body: 'body1'}];

    return getEnv({username: 'bar'})
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return findMessages(db)
        .then((messages) => {
          expect(messages).toEqual(originalMessages);
        });
      });
    });
  });

  test(`Redirects to '/' if no message with given id exists`, () => {
    const originalMessages = [{_id: new ObjectId('0000000test1'), author: 'foo', body: 'body1'}];

    return getEnv({username: 'foo'})
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app, '00000000test')
      .then((response) => {
        expect(response.header.location).toBe('/');

        return findMessages(db)
        .then((messages) => {
          expect(JSON.stringify(messages))
          .toBe(JSON.stringify(originalMessages));
        });
      });
    });
  });

  test(`Removes a message and redirects to '/'`, () => {
    const originalMessages = [
      {_id: new ObjectId('0000000test1'), author: 'foo', body: 'body1'},
      {_id: new ObjectId('0000000test2'), author: 'bar', body: 'body2'},
      {_id: new ObjectId('0000000test3'), author: 'foo', body: 'body3'},
    ];

    return getEnv({username: 'foo'})
    .then(mockMessages(originalMessages))
    .then(({app, db}) => {
      return doRequest(app, '0000000test3')
      .then((response) => {
        expect(response.header.location).toBe('/');

        return findMessages(db)
        .then((messages) => {
          expect(JSON.stringify(messages))
          .toBe(JSON.stringify(originalMessages.slice(0, -1)));
        });
      });
    });
  });
});
