jest.mock('pug');

const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
const request = require('supertest');
const login = require('../index');

const getEnv = ({username} = {}) => (
  new Promise((resolve) => {
    const router = login();
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use((req, res, next) => {
      req.user = {
        username,
      };
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
  .get('/login');
};

describe(`/login`, () => {
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
        expect(pug.renderFile.mock.calls[0][0]).toBe('pages/login.pug');
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
        });
      });
    });
  });
});
