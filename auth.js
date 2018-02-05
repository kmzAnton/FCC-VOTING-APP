var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var data = require('./data');
var db = require('./db');
var bcrypt = require('bcrypt');


passport.use('local', new LocalStrategy(
  function(username, password, done){
      db.connect(function(err){
        var dbase = db.getDb().collection('practice_user');
        return dbase.findOne({username: username},{projection:{'_id': 0}}).then(function(instance){
          if(instance !== null){
            bcrypt.compare(password, instance.password, function(err, res){
              if(err){console.log(err)}
              else{
                if(res === true){return done(null, {username:username})}
                else {console.log('Incorrect password'); return done(null, false)} 
              }
            });
          }else{console.log('This username doesn\'t exist'); return done(null, false);}
        });
      });
    
  })
);

passport.use('local.one', new LocalStrategy(
  function(username, password, done){
    if(username!== undefined && password !== undefined && username.length>2 && password.length>2){
      
      return done(null, {username:username});
    }else{return done(null, false)}
  })
);

passport.use('github',
   new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://fccvoteapp.glitch.me/auth/github/callback',
  },
  function(accessToken, refreshToken, profile, done){
    db.connect(function(err){
      db.getDb().collection('practice_user')
        .findOne({githubId: profile.id},function(err,res){
          console.log(profile);
          if(err){console.log(err); return done(null, false);}
        
          if(res){return done(null,{username:profile.username})}
          else{
            db.getDb().collection('practice_user')
              .insertOne({username: profile.username, githubId:profile.id, regDate: (new Date()).toString()})
              .then(function(){return done(null, {username: profile.username});});
              
          }
        })
    });
  }
));


passport.serializeUser(function(user, done){
  done(null, user.username);
});

passport.deserializeUser(function(username, done){
  done(null, {username: username});
});

module.exports = passport;