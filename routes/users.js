var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());


/* mounted at app.js to users/ */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null) {
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req,res,next) => {
  if (!req.session.user) {     //if user not yet authenticated w/ session, then try basic authentication method
        var authHeader = req.headers.authorization;     //basic authentication

        if (!authHeader) {                              //if no basic authentication
            var err = new Error('You are not authenticated!');

            res.setHeader('WWW-Authenticate', 'Basic');                        
            err.status = 401;
            next(err);
            return;
        }
        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');  //if yes basic auth exists

        var username = auth[0];
        var password = auth[1];

        User.findOne({username: username}) //check if username exists in db
        .then((user) => {
          if (user === null) { //if no username that matches username in db
            var err = new Error('User ' + username + ' does not exist');
            err.status = 403;
            return next(err);

          } else if (user.password !== password) {  //if incorrect pw for the user compared to db
            var err = new Error('Your password is incorrect!');
            err.status = 403;
            return next(err);
          }
          else if (username == username && password == password) {  //if correct username and pw compared to db
            req.session.user = 'authenticated';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated!');
            next(); // authorized
          } 
        })
        .catch((err) => next(err));
  }
  else { //user has logged in previously and is authenticated with session
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id') //delete cookie from client with name session-id
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.statusCode = 403; 
    next(err);
  }
});

module.exports = router;
