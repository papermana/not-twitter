jest.mock('bcryptjs');

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const {
  MongoClient,
} = require('mongodb');
const request = require('supertest');
const newuser = require('../newuser');
const consts = require('../constants.js');

const getDb = MongoClient.connect(consts.mongoTestingUrl);
const getEnv = ({loginErr = false} = {}) => (
  getDb
  .then((db) => {
    return db.dropDatabase()
    .then(() => db);
  })
  .then((db) => {
    const router = newuser({db});
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use((req, res, next) => {
      req.login = jest.fn((userObject, cb) => {
        cb(loginErr);
      });
      next();
    });
    app.use('/', router);

    return {
      app,
      db,
    };
  })
);
const doRequest = (app) => {
  return request(app)
  .post('/newuser');
};

describe('/newuser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Redirects to '/signup' if either username or password are empty`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/signup');
      });
    });
  });

  test(`Redirects to '/signup' if password doesn't pass validation`, () => {
    const username = 'foo';
    const password = '123';

    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .type('form')
      .send({username, password})
      .then((response) => {
        expect(response.header.location).toBe('/signup');
      });
    });
  });

  test(`Invokes bcrypt with the given password`, () => {
    const username = 'foo';
    const password = 'abcdefgh123';

    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .type('form')
      .send({username, password})
      .then(() => {
        expect(bcrypt.hash).toBeCalled();
        expect(bcrypt.hash.mock.calls[0][0]).toBe(password);
      });
    });
  });

  // TODO
  // Test for 'next()' being invoked with an error object in case there is a
  // problem logging in as the newly created user.

  test(`Creates a new user object and adds it to the 'users' collection with a hashed password from bcrypt`, () => {
    const username = 'foo';
    const password = 'abcdefgh123';

    bcrypt.hash = jest.fn(() => Promise.resolve('hash'));

    return getEnv()
    .then(({app, db}) => {
      return doRequest(app)
      .type('form')
      .send({username, password})
      .then((response) => {
        expect(response.header.location).toBe('/');

        return db.collection('users')
        .findOne({username})
        .then((user) => {
          expect(typeof user).toBe('object');
          expect(user).toEqual({
            _id: expect.anything(),
            username,
            password: 'hash',
          });
        });
      });
    });
  });
});
