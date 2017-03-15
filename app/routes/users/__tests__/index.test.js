const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const users = require('../index');

const getEnv = () => (
  new Promise((resolve) => {
    const router = users();
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/', router);

    resolve({
      app,
    });
  })
);
const doRequest = (app) => {
  return request(app)
  .get('/users');
};

describe(`/users`, () => {
  test(`Always redirects to '/'`, () => {
    return getEnv()
    .then(({app}) => {
      return doRequest(app)
      .then((response) => {
        expect(response.header.location).toBe('/');
      });
    });
  });
});
