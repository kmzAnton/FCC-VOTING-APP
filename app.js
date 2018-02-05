module.exports = function(data, db){
  
  var express = require('express');
  var app = express();
  var routes = require('./routes')(data);
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var passport = require('./auth');
  var session = require('express-session');
  var MongoStore = require('connect-mongo')(session);
  var db = require('./db');
  var isAuth = require('./routes/isAuth');
  
  
  app.use(express.static('public'));
  app.set('view engine', 'ejs');
  app.use(cookieParser());
  app.use(session({
    secret:'ABCDE',
    saveUninitialized: false,
    resave: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser());
  
  
  app.get('/', routes.home);
  app.get('/login', routes.login);
  app.get('/login_fail', routes.login_fail);
  app.post('/login', passport.authenticate('local',{failureRedirect: '/login_fail'}),
   routes.home
  );
  app.get('/auth/github/callback', passport.authenticate('github'), routes.home);    ///////////////////////
  
  
  
  app.get('/user/logout', routes.logout);
  app.get('/signup_fail', routes.signup_fail);
  app.post('/user/signup', 
    passport.authenticate('local.one',{failureRedirect: '/signup_fail'}),
    routes.signup_post
  );
  
  app.get('/user/:username', isAuth, routes.user_home);
  app.get('/show_polls', routes.show_polls); 
  
  app.post('/create_poll', isAuth, routes.create_poll);
  app.get('/poll/:pollName', routes.poll_page);
  app.post('/edit/:pollName', routes.poll_edit); 
  app.get('/delete/:pollName', routes.poll_delete);   
  
  app.post('/poll/:pollName/vote/:optName/by/:byUser', routes.upload_to_db_and_back);
  
  app.get('/poll/:pollName/json.json', routes.send_json_to_d3);
  app.get('/myPolls/:username', isAuth, routes.myPolls);
 
  
  return app;
}