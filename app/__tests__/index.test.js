jest.mock('pug');

const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
const {
  MongoClient,
} = require('mongodb');
const request = require('supertest');
const index = require('../index');
const consts = require('../constants.js');

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = ({username} = {}) => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = index({db});
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
  .get('/');
};

describe(`/`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Renders the correct pug template`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(pug.renderFile).toHaveBeenCalled();
        expect(pug.renderFile.mock.calls[0][0]).toBe('pages/index.pug');
      });
    });
  });

  test(`Pass username == undefined and signedIn == false to the template if no user is logged in`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1]).toEqual({
          username: undefined,
          signedIn: false,
          messages: expect.anything(),
        });
      });
    });
  });

  test(`Pass correct username and signedIn == true to the template if the user is logged in`, () => {
    const username = 'foo';

    return getEnv({username})
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1]).toEqual({
          username,
          signedIn: true,
          messages: expect.anything(),
        });
      });
    });
  });

  test(`Pass the first 20 messages from any user`, () => {
    const messages = [];

    for (let i = 0; i < 30; i++) {
      messages.push({author: 'foo', body: `body${i + 1}`});
    }

    return getEnv()
    .then(mockMessages(messages))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1].messages)
        .toEqual(messages.slice(0, 20));
      });
    });
  });

  test(`Pass messages from all users, regardless of who's logged in`, () => {
    const messages = [
      {author: 'foo', body: 'body1'},
      {author: 'bar', body: 'body2'},
    ];

    return getEnv({username: 'foo'})
    .then(mockMessages(messages))
    .then(({app}) => {
      return doRequest(app)
      .then(() => {
        expect(pug.renderFile.mock.calls[0][1].messages)
        .toEqual(messages);
      });
    });
  });
});
