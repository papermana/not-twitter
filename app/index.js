const bodyParser = require('body-parser');
const {
  MongoClient,
} = require('mongodb');
const express = require('express');
const expressSession = require('express-session');
const methodOverride = require('method-override');

const getPassport = require('./configurePassport');
const consts = require('./constants');
const mongoUrl = process.env.MONGODB_URI || consts.mongoUrl;
const routes = {
  index: require('./routes'),
  login: require('./routes/login'),
  loginpost: require('./routes/login/post'),
  logout: require('./routes/logout'),
  signup: require('./routes/signup'),
  users: require('./routes/users'),
  usersShow: require('./routes/users/show'),
  usersDelete: require('./routes/users/delete'),
  newUser: require('./routes/newuser'),
  messages: require('./routes/messages'),
  messagesShow: require('./routes/messages/show'),
  messagesDelete: require('./routes/messages/delete'),
  newMessage: require('./routes/newmessage'),
};

MongoClient.connect(mongoUrl, (err, db) => {
  if (err) {
    throw err;
  }

  const app = express();
  const passport = getPassport(db);

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

  app.listen(process.env.PORT || 3001);
});
