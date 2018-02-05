var passport = require('../auth');
var db = require('../db');
var dotenv = require('dotenv');
var MONGO_URI = process.env.MONGO_URI;
var bcrypt = require('bcrypt');


module.exports = function(data){
  var functions = {};
  var alert_msg = {
      login:'',
      signup:'',
      poll_page:'',
      create_poll:''
    };
  
  functions.home = function(req,res){
    var user = req.user;
    var obj = {
      title: 'Home page',
      user: user,
      btn: {
        login: true,
        logout: true,
        signup: true,
        home: false,
        polls: true
      }
    };

    if(user !== undefined){
      obj.btn.login = false;
      obj.btn.signup = false;
      obj.user = req.session.passport.user;
      alert_msg.create_poll='';
      res.render('page/main', {obj:obj, alert_msg:alert_msg});
    } else {
      alert_msg.create_poll='';
      res.render('page/main', {obj: obj, alert_msg:alert_msg});
    }
  };
  
  functions.login_fail = function(req,res){
    var user=req.user;
    var obj = {
      title: 'Login',
      user: user,
      btn: {
        login: false,
        signup: true,
        home: true,
        polls: false
      }
    };
    var alert_msg = {
      login:'Please, check Username and Password',
      signup:'',
      poll_page:'',
      create_poll:''
    };
    if(user === undefined){
      res.render('page/login', {obj:obj, alert_msg: alert_msg});
    } else {
      res.redirect('/login');
    }
  };
  
  functions.login = function(req,res){
    function userCheck(){
      if(req.user!==undefined){return req.session.passport.user}
      else{return undefined}
    };
    var user=req.user;
    var obj = {
      title: 'Login',
      user: userCheck(),
      btn: {
        login: false,
        logout: true,
        signup: true,
        home: true,
        polls: true
      }
    };
    if(user === undefined){
      res.render('page/login', {obj:obj, alert_msg: alert_msg});
    } else {
      res.render('page/login', {obj:obj, alert_msg: alert_msg});
    }
  };
  
  functions.logout = function(req,res){
    req.logOut();
    req.session.destroy(res.redirect('/login'));
  };
  
  functions.signup_fail = function(req,res){
    var user=req.user;
    var obj = {
      title: 'Login',
      user: user,
      btn: {
        login: false,
        signup: true,
        home: true,
        polls: false
      }
    };
    var alert_msg = {
      login:'',
      signup:'When signing up, make sure, both, username and password, have at least 3 signs',
      poll_page:'',
      create_poll:''
    };
    if(user === undefined){
      res.render('page/login', {obj:obj, alert_msg: alert_msg});
    } else {
      res.redirect('/login');
    }
  };
  
  functions.signup_post = function(req,res){
    var user = req.body.username;
    var pass = req.body.password;
    
    
    
    if(user!== undefined && pass!== undefined){
      bcrypt.hash(pass,10, function(err, hash){     
        var upload = {
          username: user,
          password: hash,
          regDate: (new Date()).toString()
        }; 

        db.connect(function(err){
          var dbase = db.getDb().collection('practice_user');
          dbase.insertOne(upload);
          res.redirect(`/`);
        });
      });
    } 
  };
  
  functions.user_home = function(req,res){
    var user = req.user;
    var obj = {
      title: 'User',
      user: req.session.passport.user,
      btn: {
        login: false,
        logout: true,
        signup: false,
        home: true,
        polls: true
      }
    };
    if(req.session.passport.user === undefined){
      res.redirect('/login');
    }else{
      res.render('page/user',{obj: obj, alert_msg:alert_msg});
    }
  };
  

  functions.show_polls = function(req,res){
    function userCheck (){
        if(req.user == undefined){return undefined}
        else{return req.session.passport.user}
      };
    var obj = {
      title: 'Polls list',
      user: userCheck(),
      btn: {
        login: true,
        logout:true,
        signup: true,
        home: true,
        polls: false
      }
    };
    db.connect(function(err){
      var cursor = db.getDb().collection('practice_poll')
        .find({}).toArray()
        .then(function(data){
          var arr = [];
          data.forEach((item)=>{
            arr.push({pollName: item.pollName, shortDesc: item.shortDesc, creator: item.creator});
          });
          res.render('page/show_polls', {obj:obj, poll:arr, alert_msg:alert_msg, aggregate: false})
        });
    });
  };
  
  functions.create_poll = function(req,res){
    var pollTitle = req.body.pollTitle.trim(),
        shortDesc = req.body.shortDesc.trim(),
        options = req.body.options;
    
    if(pollTitle == undefined || options.length!==0){
      var optEdited = options.split(',').map((item)=>{return item.trim()});
      var pollUpload = {
        pollName: pollTitle,
        shortDesc: shortDesc,
        creator: req.session.passport.user,
        regDate: (new Date()).toString(),
        pollOptions:[] 
      };
      optEdited.forEach((item)=>{
        pollUpload.pollOptions.push({optName: item, count:0, votedUsers:[]});
      });
      var obj = {
        title: 'Poll '+pollTitle,
        user: req.session.passport.user,
        btn: {
          login: false,
          signup: false,
          home: true,
          polls: true
        }
      };
      
      db.connect(function(err){
        db.getDb().collection('practice_poll').insertOne(pollUpload);
      });
      res.render('page/poll_page', {obj: obj, poll: pollUpload, alert_msg:alert_msg});
    } else {
      var obj = {
        title: 'Home',
        user: req.session.passport.user,
        btn: {
          login: false,
          signup: false,
          home: true,
          polls: true
        }
      };
      alert_msg.create_poll = 'Make sure, you have typed "Poll\'s title" and "Polls\' options';
      res.render('page/main',{obj:obj, alert_msg:alert_msg })
    }
  };
  
  
  functions.poll_page = function(req,res){
    var pollName = req.params.pollName;
    function userCheck(){
      if(req.user!==undefined){return req.session.passport.user}
      else{return null}
    };
    var obj = {
        title: 'Poll '+pollName,
        user: userCheck(),
        btn: {
          login: false,
          logout: false,
          signup: false,
          home: true,
          polls: true
        }
      };
    
    db.connect(function(err){
      db.getDb().collection('practice_poll')
        .findOne({pollName: pollName},{projection: {'_id':0}})
        .then(function(data){res.render('page/poll_page', {obj:obj, poll:data, alert_msg:alert_msg})});
    });
  };
  
  functions.poll_delete = function(req,res){
    var pollName = req.params.pollName;
    
    db.connect(function(err){
      db.getDb().collection('practice_poll').remove({pollName: pollName}, true).then(res.redirect('/show_polls'));
    });
  };
  
  functions.poll_edit = function(req,res){
    var pollName = req.params.pollName;
    var option =req.body.options;
    
    if(option){
      var obj = {optName: option, count: 0, votedUsers:[]};
      db.connect(function(err){
            db.getDb().collection('practice_poll')
              .update({pollName: pollName}, {$push:{pollOptions: obj}})
              .then(function(){res.redirect('/poll/'+pollName)});
        });
    } else{
      res.redirect('/poll/'+pollName);
    }
  };

  
  functions.upload_to_db_and_back = function(req,res){
    var pollName = req.params.pollName, 
        optName = req.params.optName,
        byUser = req.params.byUser;
    
    if(byUser == undefined){byUser = 'anonym'}
    db.connect(function(err){
      db.getDb().collection('practice_poll')
        .update(
          {pollName: pollName,
           pollOptions: {$elemMatch:{optName: optName}}},
          {$inc: {'pollOptions.$.count': 1},
           $push:{'pollOptions.$.votedUsers':byUser}})
          .then(function(){res.redirect('/poll/'+pollName)});
    });
    
  };
  
  functions.send_json_to_d3 = function(req,res){
    var pollName = req.params.pollName;
    var user;
        if(req.user == undefined){user = '';}
        else{user = req.session.passport.user}
    db.connect(function(err){
      db.getDb().collection('practice_poll')
        .findOne({pollName: pollName},{projection: {'_id':0, 'regData':0, 'shortDesc':0}})
        .then(function(data){data.user = user; res.json(data)});
    });
  };
  
  functions.myPolls = function(req,res){
    var user = req.params.username;
    function userCheck (){
        if(req.user == undefined){return undefined}
        else{return req.session.passport.user}
      };
    var obj = {
      title: 'myPolls list',
      user: userCheck(),
      btn: {
        login: true,
        logout:true,
        signup: true,
        home: true,
        polls: false
      }
    };
    
    db.connect(function(err){
      db.getDb().collection('practice_poll')
        .find({creator:user},{projection:{_id:0, regDate:0}}).toArray()
        .then(function(data){
          if(data.length!=0){
            console.log(data);
            var arr = [];
            data.forEach((item)=>{
              
              arr.push({pollName: item.pollName, pollOptions: item.pollOptions, shortDesc: item.shortDesc, creator: item.creator});
              
            });
            res.render('page/show_polls', {obj:obj, poll:arr, alert_msg:alert_msg, aggregate: true})
          }else{
            alert_msg.poll_page = 'Probably, you have not created polls, yet'; 
            res.render('page/show_polls', {obj:obj, poll:arr, alert_msg:alert_msg, aggregate: false})
          }
        });
    });
    
  };
  
  
  
  return functions;
}