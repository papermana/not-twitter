jest.mock('pug');

const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
const {
  MongoClient,
} = require('mongodb');
const request = require('supertest');
const usersShow = require('../show');
const consts = require('../../constants.js');

const username = 'foo';
const password = 'password';

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = () => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = usersShow({db});
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/', router);

    return {
      app,
      db,
    };
  })
);
const mockUser = (username, password) => {
  return ({app, db}) => (
    db.collection('users')
    .insert({username, password})
    .then(() => ({app, db}))
  );
};
const mockMessages = (messages) => {
  return ({app, db}) => (
    db.collection('messages')
    .insert(messages)
    .then(() => ({app, db}))
  );
};
const doRequest = (app) => {
  return request(app)
  .get('/users/foo');
};

describe(`/users/:username`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Redirects to '/' if the given username doesn't exist`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');
      });
    });
  });

  test(`Renders the correct pug template`, () => {
    return getEnv()
    .then(mockUser(username, password))
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(pug.renderFile).toHaveBeenCalled();
        expect(pug.renderFile.mock.calls[0][0]).toBe('pages/users/show.pug');
      });
    });
  });

  test(`Passes correct user data to the template`, () => {
    return getEnv()
    .then(mockUser(username, password))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1]).toMatchObject({
          username,
        });
      });
    });
  });

  test(`Passes a list of messages to the template if the user has any messages`, () => {
    const messages = [
      {author: username, body: 'body1'},
      {author: username, body: 'body2'},
    ];

    return getEnv()
    .then(mockUser(username, password))
    .then(mockMessages(messages))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1]).toMatchObject({
          messages: expect.anything(),
        });
        expect(pug.renderFile.mock.calls[0][1].messages).toEqual(messages);
      });
    });
  });

  test(`Passes _only_ messages belonging to the user`, () => {
    const messages = [
      {author: username, body: 'body1'},
      {author: username, body: 'body2'},
      {author: 'another-user', body: 'body3'},
    ];

    return getEnv()
    .then(mockUser(username, password))
    .then(mockMessages(messages))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1].messages).toEqual(messages.slice(0, -1));
      });
    });
  });

  test(`Passes an empty array if the user has no messages`, () => {
    const messages = [];

    return getEnv()
    .then(mockUser(username, password))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1].messages).toEqual(messages);
      });
    });
  });
});
