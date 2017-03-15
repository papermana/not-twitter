const bodyParser = require('body-parser');
const {
  MongoClient,
} = require('mongodb');
const express = require('express');
const expressSession = require('express-session');
const methodOverride = require('method-override');
const app = express();

const consts = require('./app/constants');
const routes = {
  index: require('./app'),
  login: require('./app/login'),
  loginpost: require('./app/login/post'),
  logout: require('./app/logout'),
  signup: require('./app/signup'),
  users: require('./app/users'),
  usersShow: require('./app/users/show'),
  usersDelete: require('./app/users/delete'),
  newUser: require('./app/newuser'),
  messages: require('./app/messages'),
  messagesShow: require('./app/messages/show'),
  messagesDelete: require('./app/messages/delete'),
  newMessage: require('./app/newmessage'),
};

MongoClient.connect(consts.mongoUrl, (err, db) => {
  if (err) {
    throw err;
  }

  const passport = require('./app/configurePassport')(db);

  app.use(express.static('public'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(methodOverride('_method'));
  app.use(expressSession({
    secret: 'secretino',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  Object.keys(routes).forEach(route => {
    app.use('/', routes[route]({db, passport}));
  });

  app.listen(3001);
});
