'use strict';

var Promise = require("bluebird");

/** load models **/
var models = require('../models/index.js');
var crypto = require('crypto');

var Employee = {
    'get':function(options){
       return new Promise(function(resolve,reject) {
           models.Employee.findAll({
                include:[
                  {
                    model: models.EmployeeAddressBook,
                    attributes:["phone","formattedaddress","city","zipcode","state"],order:'id desc'
                  },
                ],
             attributes:["id","name","email","isdeleted"]
           }).then(function (employees) {
               resolve(employees);
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getById':function(id){
        return new Promise(function(resolve,reject) {
            models.Employee.findOne({
                include:[
                  {
                    model: models.EmployeeAddressBook,
                    attributes:["id","addressline1","addressline2","city","state","country","email","phone","zipcode"],order:'id desc'
                  },
                  {
                    model: models.EmployeeImage
                    ,limit:1
                    ,order:'id desc'
                  },
                ]
              ,attributes:["name","gender","dob","doj","dol","id"]
              ,where: {id: id}
            }).then(function (employee) {
                if(!employee){
                    throw new Error("Employee Not Found");
                }else{
                    resolve(employee);
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    'getBasicById':function(id){
        return new Promise(function(resolve,reject) {
            models.Employee.findOne({
               attributes:["name","gender","dob","doj","dol","id"]
              ,where: {id: id}
            }).then(function (employee) {
                if(!employee){
                    throw new Error("Employee Not Found");
                }else{
                    resolve(employee);
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    'create':function(parmas){
        return new Promise(function(resolve,reject) {
            var options=parmas;
            models.Employee.create({
              name:options.name,
              gender:options.gender,
              email:options.email,
              doj:options.doj,
              dob:'1900-01-01',
              dol:'9999-12-31',
              isdeleted:0
            }).then(function (employee) {
              console.log(employee);

              var _tasks=[];
    						_tasks.push(
                  Employee.createLoginId({
                      'email':employee.email,
                      'hashkey':crypto.createHash('md5').update(employee.email+'&welcome').digest('hex'),
                      'parentId':employee.id,
                      'parentType':'Employee',
                      'authkey':crypto.createHash('md5').update(employee.email+'&welcome').digest('hex')
                  })
                );
                _tasks.push(
                  Employee.initImage(employee)
                );
                _tasks.push(
                  Employee.addAddressBook(employee,options)
                );

      					Promise.all(_tasks).then(function(){
      						console.log("employee resolved");
      						resolve(employee);
      					}).catch(function (error) {
                  console.log(error);
      						reject(error);
      					});
                // models.User.create({
                //     'email':options['email'],
                //     'hashkey':crypto.createHash('md5').update(options['email']+'&'+options['password']).digest('hex'),
                //     'parentId':employee.id,
                //     'parentType':'Employee',
                //     'authkey':crypto.createHash('md5').update(options['email']+'&'+options['password']).digest('hex')
                // }).then(function (user) {
                //     resolve(employee);
                // }).catch(function(error){
                //     reject(error);
                // });
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'update':function(id,values){
        return new Promise(function(resolve,reject) {
            models.Employee.update(values, {
                where:{id:id}
            }).then(function (affectedrows) {
                if(affectedrows>=1){
                    resolve(affectedrows);
                }else{
                    throw new Error("Employee Not Found");
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'disable':function(id){
        return new Promise(function(resolve,reject) {
            models.Employee.update({isdeleted:1},{
                where:{id:id}
            }).then(function(employee){
                resolve(employee);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'enable':function(id){
        return new Promise(function(resolve,reject) {
            models.Employee.update({isdeleted:0},{
                where:{id:id}
            }).then(function(employee){
                resolve(employee);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'delete':function(id){
        return new Promise(function(resolve,reject) {
            models.Employee.destroy({
                where:{id:id}
            }).then(function(employee){
                resolve(employee);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'destory':function(employee){
        return new Promise(function(resolve,reject) {
            employee.destroy().then(function(employee){
                resolve(employee);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'createLoginId':function(options){
      return new Promise(function(resolve,reject) {
        models.User.create(options).then(function (user) {
            resolve(user);
        }).catch(function(error){
            console.log(error);
            //throw new Error("Unable to add user");
            reject(eror);
        });
      });

    },
    'getAddressBookByEmployeeId':function(id){
        return new Promise(function(resolve,reject){
            models.Employee.findAll({include:{
                model:models.EmployeeAddressBook
            },attributes:["id","name"],
                where:{
                    id:[
                        id
                    ]
                }
            }).then(function(employee){
                if(employee.length<=0){
                    throw new Error("employee address not found");
                }else{
                    resolve(employee);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getEmployeeAddressBookById':function(employeeid,id){
        return new Promise(function(resolve,reject){
            models.EmployeeAddressBook.findOne({
                where:{
                    EmployeeId: employeeid,
                    id:id
                }
            }).then(function(address){
                if(address.length<=0){
                    throw new Error("no employee address found");
                }else{
                    resolve(address);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'addAddressBook':function(employee,options){
        return new Promise(function(resolve,reject) {
        options['isprimary']=(options['isprimary']==undefined)?0:options['isprimary'];
        options['isdeleted']=(options['isdeleted']==undefined)?0:options['isdeleted'];
            employee.createEmployeeAddressBook(options).then(function(v){
                resolve(v);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'deleteEmployeeAddressBookById':function(address){
        return new Promise(function(resolve,reject) {
            models.EmployeeAddressBook.destroy({where:{EmployeeId: employeeid,id:id}}).then(function(v){
                resolve(v);
            }).catch(function(error){
                resolve(error);
            });
        });
    },
    'deleteEmployeeAddressBook':function(address){
        return new Promise(function(resolve,reject) {
            address.destroy().then(function(v){
                resolve(v);
            }).catch(function(error){
                resolve(error);
            });
        });
    },
    'updateEmployeeAddressBook':function(employeeid,id,values){
        return new Promise(function(resolve,reject) {
            models.EmployeeAddressBook.update(values,{where:{EmployeeId: employeeid,id:id}}).then(function(affectedrows){
                    resolve(affectedrows);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'initImage':function(employee){
      return new Promise(function(resolve,reject) {
        employee.createEmployeeImage({
            'filename':'/www/assets/nophoto_user.png',
            'mimetype':'image/png',
            'size':0,
            'isdeleted':0
        }).then(function(image) {
          resolve(image);
        }).catch(function(error) {
          reject(error);
        });
     });
    },
    'uploadImage':function(id,image){
      return new Promise(function(resolve,reject) {
        models.Employee.findOne({
          where: {id: id}
        }).then(function (employee) {
          if (employee.length <= 0) {
            reject("Employee Not Found");
          } else {
            employee.createEmployeeImage(image).then(function (image) {
              resolve(image)
            }).catch(function (err) {
              console.log(err);
              reject(err);
            });
          }
        }).catch(function (error) {
          reject(error);
        });
      });
    }
}

module.exports = Employee;
