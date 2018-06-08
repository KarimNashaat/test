var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var Validations = require('../utils/validations');
var Encryption = require('../utils/encryption');
var EMAIL_REGEX = require('../config').EMAIL_REGEX;
var User = mongoose.model('User');
var multer = require('multer');
var path = require('path');
const fs = require('fs');
const fetch = require('node-fetch')
var csv = require('fast-csv'); 



var store = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, './uploads');
    },
    filename:function(req,file,cb){
        cb(null, file.originalname);
    },
  });
  
  
var upload = multer({storage:store}).single('file');


module.exports.fileUpload =  function(req,res,next){
    User.findById(req.decodedToken.user._id).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(404)
          .json({ err: null, msg: 'User not found.', data: null });
      }
  
    
    upload(req,res,function(err){
        if(err){
            
            return res.status(501).json({error:err});
        }
        //do all database record saving activity
       
       fs.readFile(req.file.path, 'utf8' ,(err, data) => {
            if (err) throw err;
            
            var converted =convert(data,req.file.originalname); 
            fs.unlinkSync(req.file.path);
            var arr = req.file.originalname.split(".");
            var originalName = arr[0];
            var file = { 
              stringValue : converted,
              name : originalName,
            }
            var newFile = user.files.create(file);
            user.files.push(newFile);
            user.save(function(err) {
              if (err) {
                return next(err);
              }
              res.status(201).json({
                err: null,
                msg: 'File saved',
                data: newFile,
              });
            });
        
  
          });
      
        
    });
  });
  };


  function convert(json,filename) {
    
    if(json == '')
        return;
    json = JSON.parse(json);
    // Find the largest element
    var largestEntry = 0;
    var header;
    for(var i=0; i<json.length; i++){
        if (!Object.keys) {
            Object.keys = function(obj) {
                var keys = [];
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        keys.push(i);
                    }
                }
                return keys;
            };
        }
        if(Object.keys(json[i]).length > largestEntry){
            largestEntry = Object.keys(json[i]).length;
            header = Object.keys(json[i]);
        }
    };
    // Assemble the header
    var convertedjson = "";
    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function(callback){
          for (var i = 0; i < this.length; i++){
            callback.apply(this, [this[i], i, this]);
          }
        };
    }
    header.forEach(function(heading){
        if(convertedjson != "") {
            convertedjson += ",";
        }
        convertedjson += "\"";
        convertedjson += heading
        convertedjson += "\"";
    });
    convertedjson += "\r\n";
    // Iterate through the header for all elements
    json.forEach(function(entry){
        header.forEach(function(heading){
            convertedjson += "\"";
            convertedjson += (entry[heading] || "");
            convertedjson += "\"";
            convertedjson += ",";
        });
        convertedjson = convertedjson.substring(0, convertedjson.length - 1);
        convertedjson += "\r\n";
    });
  return convertedjson;

  
  }




  module.exports.downloadFile =function(req,res,next){
    
    User.findById(req.decodedToken.user._id).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(404)
          .json({ err: null, msg: 'User not found.', data: null });
      }
     
      var file = user.files.id(req.body.ID);
      if (!file) {
        return res
          .status(404)
          .json({ err: null, msg: 'file not found.', data: null });
      }
      var convertedjson = file.stringValue ; 
    
      var filePath2='./uploads/'+file.name+".csv"; 
      //     fs.writeFile(path, convertedjson,{
      //         headers:true
      //     }, function(err,data) {
      //      if (err) {throw err;}
      //      else{ 
      //        console.log('file Created');
           
      //       //I need to download above creating csv file here
      //      }
      //  }); 
      var arr = convertedjson.split("\r\n");
      var d = [] ;
      for ( var i = 0 ; i < arr.length ; i ++){
        d[i]  = [arr[i].slice(0,arr[i].length-1)];
      }
 
      var ws = fs.createWriteStream(filePath2);

      csv.write(d,{headers:undefined,columns:true, sendHeaders: true}).pipe(ws);
      setTimeout(() => {
        next();
      }, 1000);
      setTimeout(() => {
        fs.unlinkSync(filePath2);
      }, 10000);
    });

    
  };


  module.exports.getAllFiles = function(req,res,next){
    User.findById(req.decodedToken.user._id).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(404)
          .json({ err: null, msg: 'User not found.', data: null });
      }
      res.status(200).json({
        err: null,
        msg: 'Files retrieved successfully.',
        data: user.files,
      });


    });
  }


  function download(res,filename,next){
   

  }