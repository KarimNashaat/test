var express = require('express');
var jwt = require('jsonwebtoken');
var authCtrl = require('../controllers/auth.controller');
var fileCtrl = require('../controllers/file.controller');
var router = express.Router();
var path = require('path');

var isAuthenticated = function(req, res, next) {
  // Check that the request has the JWT in the authorization header
  var token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      error: null,
      msg: 'You have to login first before you can access your lists.',
      data: null
    });
  }
  // Verify that the JWT is created using our server secret and that it hasn't expired yet
  jwt.verify(token, req.app.get('secret'), function(err, decodedToken) {
    if (err) {
      return res.status(401).json({
        error: err,
        msg: 'Login timed out, please login again.',
        data: null
      });
    }
    req.decodedToken = decodedToken;
    next();
  });
};

var isNotAuthenticated = function(req, res, next) {
  // Check that the request doesn't have the JWT in the authorization header
  var token = req.headers['authorization'];
  if (token) {
    return res.status(403).json({
      error: null,
      msg: 'You are already logged in.',
      data: null
    });
  }
  next();
};



router.post('/upload', isAuthenticated,fileCtrl.fileUpload);


router.post('/download', isAuthenticated,fileCtrl.downloadFile,function(req,res,next){
  console.log("here2");
  filepath = path.join(__dirname,'../../uploads') +'/'+req.body.fileName+'.csv';
  res.sendFile(filepath);});

router.get('/file/getAllFiles', isAuthenticated,fileCtrl.getAllFiles);






//-----------------------------Authentication Routes-------------------------
router.post('/auth/register', isNotAuthenticated, authCtrl.register);
router.post('/auth/login', isNotAuthenticated, authCtrl.login);

//-------------------------------List Routes---------------------------------


module.exports = router;
