'use strict';
var _ = require("lodash");
var geolib = require("geolib");
var Promise = require("bluebird");

/** load models **/
var models = require('../models/index.js');


var Market = {
    'get':function(options){
       return new Promise(function(resolve,reject) {
           models.Market.findAll({
            // include:[
            //       {
            //         model: models.MarketAddressBook,
            //         attributes:["id","phone","formattedaddress","city","zipcode"],order:'id desc'
            //       },                  
            //       {
            //         model: models.MarketContact,
            //         attributes:["id","name"],order:'id desc'
            //       },                  
            //     ],
            //attributes:["id","name","isdeleted"]
           }).then(function (_markets) {
           var _ml=_markets.length;
           var markets=[];
           while(_ml--){

            var _nextBusinessDay='2017-05-01 07:00-12:30';
            var _nextDeliveryDay='2017-05-01 07:00-12:30';

            markets.push({
                    id: _markets[_ml].id,
                    name:_markets[_ml].name,
                    isdeleted:_markets[_ml].isdeleted,
                    nextBusinessDay:_nextBusinessDay,
                    nextDeliveryDay:_nextDeliveryDay
                });  
           }


            console.log(markets);

               resolve(markets);
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getMarketsForAPI':function(options){
       return new Promise(function(resolve,reject) {
           models.Market.findAll({
            include:[
                  {
                    model: models.MarketAddressBook,
                    attributes:["id","phone","formattedaddress","city","zipcode"],order:'id desc'
                  }                  
                ],
            where:{
                    isdeleted:0
             },
             attributes:["id","name"]
           }).then(function (markets) {
               var _markets=[];
               _.map(markets,function(market,index){
                   if(_.has(market,'MarketAddressBooks[0]')){
                       var km = geolib.getDistance(
                           {latitude: options.lat, longitude: options.lng},
                           {latitude: market.MarketAddressBooks[0].latitude, longitude: market.MarketAddressBooks[0].longitude}
                       );
                       km = Math.abs(km*0.000621371);
                       console.log(km);
                       if(options.range>=0 && km<=options.range){
                           _markets.push(market);
                       }
                    }
                });
               resolve(_markets);
           }).catch(function (error) {
               reject(error);
           });
       });
    },
    'getById':function(id){
        return new Promise(function(resolve,reject) {
            models.Market.findOne({
                include:[
                  {
                    model: models.MarketAddressBook,
                    order:'id desc'
                  },                  
                  {
                    model: models.MarketContact,
                    attributes:["id","name"],order:'id desc'
                  },                  
                ]
              ,where: {id: id}
            }).then(function (market) {
                if(market.length<=0){
                    throw new Error("Market Not Found");
                }else{
                    resolve(market);
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    'getByIdForAPI':function(id){
        return new Promise(function(resolve,reject) {
            models.Market.findOne({
                include:[
                  {
                    model: models.MarketAddressBook,
                    attributes:["phone","formattedaddress","city","zipcode"],order:'id desc'
                  },                  
                ]
              ,where: {id: id}
            }).then(function (market) {
                if(market.length<=0){
                    throw new Error("Market Not Found");
                }else{
                    resolve(market);
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    'getBasicOnly':function(options){
       return new Promise(function(resolve,reject) {
           models.Market.findAll({
             attributes:["id","name"],
             where:{
                 isdeleted:0
             }
           }).then(function (markets) {
               resolve(markets);
           }).catch(function (error) {
               reject(error);
           });
       });
    },    
    'create':function(options){
        return new Promise(function(resolve,reject) {
            models.Market.create({
                name: options['name']
            }).then(function (market) {
                resolve(market);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'update':function(marketid,parmas){
        return new Promise(function(resolve,reject) {
            models.Market.update(parmas,{where:{id:marketid}}).then(function(results){
              resolve(results);
            }).catch(function(error){
              reject(error);
            });
        });
    },
    'disable':function(id){
        return new Promise(function(resolve,reject) {
            models.Market.update({isdeleted:1},{
                where:{id:id}
            }).then(function(market){
                resolve(market);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'enable':function(id){
        return new Promise(function(resolve,reject) {
            models.Market.update({isdeleted:0},{
                where:{id:id}
            }).then(function(market){
                resolve(market);
            }).catch(function(error){
                reject(error);
            });
        });
    },

    'destory':function(market){
        return new Promise(function(resolve,reject) {
            market.destroy().then(function(market){
                resolve(market);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getAddressBookByMarketId':function(id){
        return new Promise(function(resolve,reject){
            models.Market.findAll({include:{
                model:models.MarketAddressBook
            },attributes:["id","name"],
                where:{
                    id:[
                        id
                    ]
                }
            }).then(function(market){
                if(market.length<=0){
                    throw new Error("market address not found");
                }else{
                    resolve(market);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getMarketAddressBookById':function(marketid,id){
        return new Promise(function(resolve,reject){
            models.MarketAddressBook.findOne({
                where:{
                    MarketId: marketid,
                    id:id
                }
            }).then(function(address){
                if(address.length<=0){
                    throw new Error("no market address found");
                }else{
                    resolve(address);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'addAddressBook':function(market,options){
        return new Promise(function(resolve,reject) {
            market.createMarketAddressBook(options).then(function(v){
                resolve(v);
            }).catch(function(error){
                console.log(error);
                reject(error);
            });
        });
    },
    'deleteMarketAddressBook':function(address){
        return new Promise(function(resolve,reject) {
            address.destroy().then(function(v){
                resolve(v);
            }).catch(function(error){
                resolve(error);
            });
        });
    },
    'updateMarketAddressBook':function(marketid,id,values){
        return new Promise(function(resolve,reject) {
            if(values.isdeleted==undefined){
                values.isdeleted=0;
            }
            models.MarketAddressBook.update(values,{where:{MarketId: marketid,id:id}}).then(function(affectedrows){
                if(affectedrows<=0){
                    throw new Error("Market Address Not Found");
                }else{
                    resolve(affectedrows);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getContactByMarketId':function(id){
        return new Promise(function(resolve,reject){
            models.Market.findAll({include:{
                model:models.MarketContact
            },attributes:["id","name"],
                where:{
                    id:[
                        id
                    ]
                }
            }).then(function(market){
                if(!market || market.length<=0){
                    throw new Error("no market found");
                }else{
                    resolve(market);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getContactById':function(marketid,contactid){
        return new Promise(function(resolve,reject){
            models.MarketContact.findOne({attributes:["id","name"],
                where:{
                    MarketId: marketid,
                    id:contactid
                }
            }).then(function(contact){
                if(!contact || contact.length<=0){
                    throw new Error("no contact found");
                }else{
                    resolve(contact);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'addContact':function(market,options){
        return new Promise(function(resolve,reject) {
            market.createMarketContact({
                name: options['name']
            }).then(function (contact) {
                resolve(contact);
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    'updateContact':function(marketid,id,values){
        return new Promise(function(resolve,reject) {
            models.MarketContact.update(values,{where:{
                MarketId: marketid,
                  id:id
            }}).then(function(affectedrows){
                if(affectedrows<=0){
                    throw new Error("Market Contact Not Found");
                }else{
                    resolve(affectedrows);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'deleteContact':function(contact){
        return new Promise(function(resolve,reject) {
            contact.destroy().then(function(v){
                resolve(v);
            }).catch(function(error){
                resolve(error);
            });
        });
    },
/*
        return new Promise(function(resolve,reject) {
            market.createMarketContact({
                name: options['name']
            }).then(function (contact) {
                resolve(contact);
            }).catch(function (error) {
                reject(error);
            });
        });
*/    
    'getVendors':function(id){
        return new Promise(function(resolve,reject) {
            models.Market.findOne({
               include:{
                 model:models.MarketVendor
                 ,include:{
                      model:models.Vendor
                     ,attributes:["id","name"]
                 }
                 ,attributes:["id"]
               }
               ,attributes:["name"] 
               ,where:{
                   id:id
               }
            }).then(function(m){
                resolve(m);
            }).catch(function(e){
                console.log(e);
                reject(e);
            })
        });
    }, 
    'addVendor':function(marketid,vendorid){
        return new Promise(function(resolve,reject) {
            models.Market.findOne({
               where:{
                   id:marketid
               }
            }).then(function(m){
                m.createMarketVendor({
                    VendorId: vendorid
                }).then(function (mv) {
                    resolve(mv);
                }).catch(function (error) {
                    reject(error);
                });
            }).catch(function(e){
                reject(e);
            })
        });
    },    
    'updateVendor':function(newmarketid,oldmarketid,vendorid){
        return new Promise(function(resolve,reject) {
            models.MarketVendor.update(
                {
                    MarketId:newmarketid
                },
                {
                    where:{
                        MarketId:oldmarketid,VendorId:vendorid
                    }
                }
            )
            .then(function(results){
              resolve(results);
            }).catch(function(error){
              reject(error);
            });
        });
    }
    /*

    'getAddressBookByContactId':function(marketid,contactid){
        return new Promise(function(resolve,reject){
            models.MarketContact.findAll({include:{
                model:models.MarketContactAddressBook
            },attributes:["id","name"],
                where:{
                    MarketId: marketid,
                    id:contactid
                }
            }).then(function(market){
                if(market.length<=0){
                    throw new Error("no address found");
                }else{
                    resolve(market);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'getContactAddressBookById':function(marketcontactid,id){
        return new Promise(function(resolve,reject){
            models.MarketContactAddressBook.findOne({
                where:{
                    MarketContactId: marketcontactid,
                    id:id
                }
            }).then(function(address){
                if(address.length<=0){
                    throw new Error("no contact address found");
                }else{
                    resolve(address);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'addContactAddressBook':function(marketcontact,options){
        options['isprimary']=(options['isprimary']==undefined)?0:options['isprimary'];
        options['isdeleted']=(options['isdeleted']==undefined)?0:options['isdeleted'];
        return new Promise(function(resolve,reject) {
            marketcontact.createMarketContactAddressBook(options).then(function(v){
                resolve(v);
            }).catch(function(error){
                reject(error);
            });
        });
    },
    'deleteContactAddressBook':function(address){
        return new Promise(function(resolve,reject) {
            address.destroy().then(function(v){
                resolve(v);
            }).catch(function(error){
                    resolve(error);
            });
        });
    },
    'updateContactAddressBook':function(marketcontactid,id,values){
        return new Promise(function(resolve,reject) {
            models.MarketContactAddressBook.update(values,{where:{MarketContactId: marketcontactid,id:id}}).then(function(affectedrows){
                if(affectedrows<=0){
                    throw new Error("Market Contact Address Not Found");
                }else{
                    resolve(affectedrows);
                }
            }).catch(function(error){
                reject(error);
            });
        });
    },
    
    'getProducts':function(id){
      return new Promise(function(resolve,reject) {
        models.Product.findAll({
          include:[
            {
              model: models.Inventory,
            },
            {
              model: models.Market,
              where:{
                id:id
              }
            },
          ]
        }).then(function (product) {
          if(product.length<=0){
            throw new Error("Products are not Found");
          }else{
            resolve(product);
          }
        }).catch(function (error) {
          reject(error);
        });
      });
    },
    'addProduct':function(id,options){
      options["status"]=1;
      return new Promise(function(resolve,reject) {

        models.Market.findOne({
          attributes:["id"],
          where:{id:id}
        }).then(function(market){
          if(market.length<=0){
            throw new Error("Market not Found");
          }else{
            market.createProduct(options).then(function(product){
              resolve(product);
            }).catch(function(err){
              console.log(err);
              reject(err);
            });
          }
        }).catch(function(err){
          reject(err);
        });


        //models.Product.findAll({
        //  include:[
        //    {
        //      model: models.Inventory,
        //    },
        //    {
        //      model: models.Market,
        //      where:{
        //        id:id
        //      }
        //    },
        //  ]
        //}).then(function (product) {
        //  if(product.length<=0){
        //    throw new Error("Products are not Found");
        //  }else{
        //    resolve(product);
        //  }
        //}).catch(function (error) {
        //  reject(error);
        //});
      });
          }
      */
}
module.exports = Market;