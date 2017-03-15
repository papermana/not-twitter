jest.mock('passport');

const express = require('express');
const request = require('supertest');
const passport = require('passport');
const loginPost = require('../post');

const getEnv = () => (
  new Promise((resolve) => {
    const router = loginPost({passport});
    const app = express();

    app.use('/', router);

    resolve({
      app,
    });
  })
);
const doRequest = (app) => {
  return request(app)
  .post('/login');
};

passport.authenticate = jest.fn(() => {
  return (req, res, next) => next();
});

describe(`/login POST`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Invokes 'passport.authenticate()'`, () => {
    const username = 'foo';
    const password = 'password';

    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .send({username, password})
      .then(() => {
        expect(passport.authenticate).toHaveBeenCalled();
      });
    });
  });
});
