const express = require('express');
const request = require('supertest');
const logOut = require('../logout');

const logout = jest.fn();

const getEnv = () => (
  new Promise((resolve) => {
    const router = logOut();
    const app = express();

    app.use((req, res, next) => {
      req.logout = logout;
      next();
    });
    app.use('/', router);

    resolve({
      app,
    });
  })
);
const doRequest = (app) => {
  return request(app)
  .post('/logout');
};

describe(`/logout`, () => {
  test(`Calls 'req.logout' provided by 'passport', and redirects to '/'`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');
        expect(logout).toHaveBeenCalled();
      });
    });
  });
});
