/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const multer = require('multer');
const moment = require('moment');

const now = moment(moment.now().ISO_8601).format('YYYY-MM-DD');

const imageFilter = (req, file, cb) => {
  console.log(file);
  if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(null, false);
};
const upload = multer({ dest: path.join(__dirname, `public/uploads/${now}`), fileFilter: imageFilter });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
// const homeController = require('./controllers/home');
const userController = require('./controllers/user');
// const apiController = require('./controllers/api');
// const contactController = require('./controllers/contact');
const articleController = require('./controllers/article');
const categoryControler = require('./controllers/category');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.method === 'POST' && ['/admin/create-article', '/admin/update-article'].includes(req.path)) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user &&
    req.path === '/account') {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
// app.get('/', homeController.index);
// app.get('/login', userController.getLogin);
// app.post('/login', userController.postLogin);
// app.get('/logout', userController.logout);
// app.get('/forgot', userController.getForgot);
// app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
// app.get('/signup', userController.getSignup);
// app.post('/signup', userController.postSignup);
// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
// app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
// app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Admin routes.
 */
app.get('/admin/login', userController.getLogin);
app.post('/admin/login', userController.postLogin);
app.get('/admin/logout', userController.logout);

app.get('/admin/index', passportConfig.isAuthenticated, (req, res) => {
  const options = {
    username: req.user.profile.name,
  };
  res.render('admin/index', options);
});
app.get('/admin/list-user', passportConfig.isAuthenticated, userController.listUser);
app.get('/admin/register-user', passportConfig.isAuthenticated, userController.getRegisterUser);
app.post('/admin/register-user', passportConfig.isAuthenticated, userController.postRegisterUser);
app.get('/admin/profile', passportConfig.isAuthenticated, userController.getAccount);
app.post('/admin/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/admin/updatePassword', passportConfig.isAuthenticated, userController.postUpdatePassword);

app.get('/admin/list-article', passportConfig.isAuthenticated, articleController.getListArticle);
app.get('/admin/create-article', passportConfig.isAuthenticated, articleController.getCreateArticle);
app.post('/admin/create-article', passportConfig.isAuthenticated, upload.single('image'), articleController.postCreateArticle);
app.post('/admin/update-article', passportConfig.isAuthenticated, upload.single('image'), articleController.postUpdateArticle);
app.get('/admin/delete-article', passportConfig.isAuthenticated, articleController.getDeleteArticle);

app.get('/admin/list-category', passportConfig.isAuthenticated, categoryControler.getListCategory);
app.get('/admin/create-category', passportConfig.isAuthenticated, categoryControler.getCreateCategory);
app.get('/admin/delete-category', passportConfig.isAuthenticated, categoryControler.getDeleteCategory);
app.post('/admin/create-category', passportConfig.isAuthenticated, categoryControler.postCategory);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
