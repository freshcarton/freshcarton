'use strict';

var Promise = require("bluebird");

/** load models **/
var models = require('../models/index.js');
var crypto = require('crypto');
var User = {
    'login':function(options){
       return new Promise(function(resolve,reject) {
           var _h=crypto.createHash('md5').update(options['email']+'&'+options['hashkey']).digest('hex');
           models.User.findOne({
               where:{email:options['email'],hashkey:_h}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    var _h=crypto.createHash('md5').update(user.authkey).digest('hex');
                    user.update({'authkey':_h});
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'loginFromEmployeeApp':function(options){
       return new Promise(function(resolve,reject) {
           var _h=crypto.createHash('md5').update(options['email']+'&'+options['hashkey']).digest('hex');
           models.User.findOne({
               where:{email:options['email'],hashkey:_h,parentType:'Employee'}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    var _h=crypto.createHash('md5').update(user.authkey).digest('hex');
                    user.update({'authkey':_h});
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'auth':function(options){
       return new Promise(function(resolve,reject) {
           models.User.findOne({
               attributes:["id","email","parentId","parentType"],
               where:{authkey:options['authkey']}
           }).then(function (user) {
                if(!user){
                    reject("User Not Found");
                }else{
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'get':function(options){
       return new Promise(function(resolve,reject) {
           models.User.findOne({
               include:[{model:models.Employee,attributes:["id","name"]},{model:models.Vendor,attributes:["id","name"]}],
               attributes:["id","email","parentType","parentId"],
               where:{authkey:options['authkey']}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getVendor':function(options){
       return new Promise(function(resolve,reject) {
           models.User.findOne({
               include:[{model:models.Vendor,attributes:["id","name"]}],
               attributes:["id","email","parentType","parentId"],
               where:{id:options['id']}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getEmployee':function(options){
       return new Promise(function(resolve,reject) {
           models.User.findOne({
               include:[{model:models.Employee,attributes:["id","name"]}],
               attributes:["id","email","parentType","parentId"],
               where:{id:options['id']}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getCustomer':function(options){
       return new Promise(function(resolve,reject) {
           models.User.findOne({
               include:[{model:models.Customer,attributes:["id","name"]}],
               attributes:["id","email","parentType","parentId"],
               where:{authkey:options['authkey']}
           }).then(function (user) {
                if(!user){
                    throw new Error("User Not Found");
                }else{
                    resolve(user);
                }
           }).catch(function (error) {
               reject(error);
           });
       });
    }
};

module.exports = User;
