const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const messagesShow = require('../show');

const getEnv = () => (
  new Promise((resolve) => {
    const router = messagesShow();
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
  .get('/messages/00000000test');
};

describe(`/messages/:messageId`, () => {
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
