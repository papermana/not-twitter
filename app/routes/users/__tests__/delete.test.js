const express = require('express');
const bodyParser = require('body-parser');
const {
  MongoClient,
} = require('mongodb');
const request = require('supertest');
const usersDelete = require('../delete');
const consts = require('../../../constants.js');

const username = 'foo';
const password = 'password';

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = ({username} = {}) => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = usersDelete({db});
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
const mockUser = (username, password) => {
  return ({app, db}) => (
    db.collection('users')
    .insert({username, password})
    .then(() => ({app, db}))
  );
};
const doRequest = (app) => {
  return request(app)
  .delete('/users/foo');
};
const getUser = (db, username) => {
  return db.collection('users')
  .findOne({username});
};

describe(`/users/:username DELETE`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Redirects to '/' if the user is not logged in`, () => {
    return getEnv({username: undefined})
    .then(mockUser(username, password))
    .then(({app, db}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return getUser(db, username)
        .then(user => {
          expect(user).toBeDefined();
        });
      });
    });
  });

  test(`Redirects to '/' if the user is logged in but has a different username`, () => {
    return getEnv({username: 'bar'})
    .then(mockUser(username, password))
    .then(({app, db}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return getUser(db, username)
        .then(user => {
          expect(user).toBeDefined();
        });
      });
    });
  });

  test(`Removes the user data if authorization is correct, and redirects to '/'`, () => {
    return getEnv({username: 'bar'})
    .then(mockUser(username, password))
    .then(({app, db}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');

        return getUser(db, username)
        .then(user => {
          expect(user).toBeNull();
        });
      });
    });
  });
});
