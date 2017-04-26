'use strict';

var express = require('express');
var path = require('path');

/** routers & controllers **/
var requestparameters=require('../bin/requestparameters.js');
var user=require('../controllers/user.js');
var order=require('../controllers/order.js');
var vendor=require('../controllers/vendor.js');
var product=require('../controllers/product.js');
var customer=require('../controllers/customer.js');
var router = express.Router();
var bodyParser = require('body-parser');
var math = require('mathjs');
var request = require('request');
var braintree = require("braintree");
/*

remove comment for production

var gateway = braintree.connect({
    environment: braintree.Environment.Production,
    merchantId: "",
    publicKey: "",
    privateKey: ""
});
*/

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "2t62rpghphf9nmjv",
    publicKey: "vn3dpth2n3zjxb3f",
    privateKey: "6ca66a7927540f69e80143078b900ac1"
});

/* Customer App API */

router
.get('/store/api/paymentservice.js',function(req, res, next) {
  res.setHeader('content-type','text/javascript');
  gateway.clientToken.generate({}, function (err, response) {
	if(err){
		res.render('freshmarket_services',{clientToken: "unknown"});
	}
  	var clientToken = response.clientToken;
	clientToken = 'sandbox_dpkzjg9m_2t62rpghphf9nmjv'; // comment  after production	
	res.render('freshmarket_services',{clientToken: clientToken});
  });
  /*res.render('freshmarket_services'); */
})
.get('/store/api/customer/',function(req, res, next) {
  user.login(requestparameters.getBasicAuthDetais(req)).then(function(result){
    console.log(result);
    res.json({rc:0,message:'welcome',data:{id:result.parentId, authkey:result.authkey}});
  }).catch(function(err){
    res.json({rc:-1,message:'invalid user details 1'});
  });
})

/*
.get('/store/api/vendors/',function(req,res,next){
    vendor.getVendorsForAPI().then(function(vendors){
        res.json({rc:0,vendors:vendors});
    }).catch(function(err){
        res.json({rc:-1,message:'invalid details requested',vendors:{}});
    });
})
*/


.get('/store/api/vendors/:id/products',function(req,res,next){
    product.getByVendorForAPI(req.params.id).then(function(products){
      res.json({rc:0,products:products});
    }).catch(function(err){
      res.json({rc:-1,message:err.message,products:{}});
    });
})
.get('/customer/api/vendors/:id/',function(req,res,next){
    if(req.query.callback == undefined || req.query.token == undefined){
        res.status(404).send('Not found');
    }else{
        res.set('Content-Type', 'application/x-javascript');
        res.set('Expires', '0');
        user.auth({'authkey':req.query.token}).then(function(currentuser){
          vendor.getByIdForAPI(req.params.id).then(function(vendors){
                var buff = new Buffer(JSON.stringify({rc:0,data:vendors})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            }).catch(function(err){
                var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid details requested'})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            });
        }).catch(function(err){
            var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid user details 2'})).toString("base64");
            res.send(req.query.callback+'("'+buff+'")');
        })

    }
})
.get('/store/api/customer/:customerid/orders/',function(req,res,next){

    user.getCustomer({authkey:req.query.token}).then(function(user){
        if(user.parentType=='customer'){
		  order.getByCustomerId({customerid:user.parentId}).then(function(orders){
				res.json({rc:0,orders:orders});
			}).catch(function(err){
			  res.json({rc:0,orders:[],error:err});
			});

        }else{
            res.status(404).send('invalid user details 3');
        }
    }).catch(function(error){
       res.json({rc:-1,message:'invalid user details 4'});
    });

})
.get('/store/api/customer/:customerid/orders/:id',function(req,res,next){
    user.getCustomer({authkey:req.query.token}).then(function(user){
        if(user.parentType=='customer'){
		  order.getById({id:req.params.id}).then(function(orders){
				res.json({rc:0,orders:orders});
			}).catch(function(err){
			  res.json({rc:-1,orders:[],error:err});
			});
        }else{
            res.status(404).send('invalid user details 5');
        }
    }).catch(function(error){
       res.json({rc:-1,message:'invalid user details 6'});
    });
})
.get('/store/api/customer/:customerid/createordertoken',function(req,res,next){
	user.get({authkey:req.query.token}).then(function(user){
		if(user.parentType=='customer'){
			gateway.clientToken.generate({}, function (err, response) {
    				 res.json({rc:0,token:response.clientToken});
  			});
		}else{
			res.json({rc:-1,message:'invalid user details 7'});
		}
	}).catch(function(error){
       res.json({rc:-1,message:'invalid user details 8'});
    });
})
.post('/store/api/customer/:customerid/orders/',function(req,res,next){
    //console.log("i m here");
    //console.log(req.query.token);
    user.get({authkey:req.query.token}).then(function(user){
        if(user.parentType=='customer'){
	console.log(user.email);
			var _reqp=requestparameters.getPostParameters(req);
			var _json=new Buffer(_reqp['json'], 'base64').toString('ascii');
			var _params=JSON.parse(_json);
			var _address=_params.customer.deliveryAddress;
			//_address['email']=user.email;
			customer.findById(req.params.customerid).then(function(_newcustomer){
				customer
					.addContact(_newcustomer,{
								name:_newcustomer.name,
								isprimary:1,
								isdeleted:0
					}).then(function(_contact){
					customer
						.addContactAddressBook(_contact.id,_address)
						.then(function(_newcustomeraddress){
							var _reqp=requestparameters.getPostParameters(req);
							var _json=new Buffer(_reqp['json'], 'base64').toString('ascii');
							var _params=JSON.parse(_json);
							var _orderparams={
								CustomerId:_newcustomer.id,
								name:order.generate(10)+_newcustomer.id,
								EmployeeId:0,
								CustomerDeliveryAddressBookId:_newcustomeraddress.id,
								CustomerBillingAddressBookId:_newcustomeraddress.id,
								scheduleAt:_params.customer.scheduledate+" "+_params.customer.scheduletime,
								deliveryAt:'9999-12-31',
								status:'new',
								isdeleted:0,
								EmployeeSignatureImageId:0,
								CustomerSignatureImageId:0,
								VendorContactAddressBookId:0,
								TotalAmount:0,
								deliveryfee:6.99
							};
							order.create(_orderparams,_params.items).then(function(_neworder){
								res.json({rc:0,message:'order placed succesfully ',customer:_newcustomer.id,order:_neworder.id,subtotalamount:_neworder.TotalAmount,totalamount:_neworder.TotalAmount+6.99,tax:0,deliveryfee:6.99,});
							});

						})
						.catch(function(err){
							res.json({rc:-1,message:'address details are not provided',order:[]});
						});

					}).catch(function(err){
						res.json({rc:-1,message:'address details are not provided',order:[]});
					});

			}).catch(function(err){
				res.json({rc:-1,message:'address details are not provided',order:[]});
			});

        }else{
            res.status(404).send('invalid user type details');
        }
    }).catch(function(error){
       console.log(error);
       res.json({rc:-1,message:'invalid user details 9'});
    });
})
.post('/store/api/customer/:customerid/confirmorder/:id/',function(req,res,next){
	user.get({authkey:req.query.token}).then(function(user){
		order.findOrderForSettlement(req.params.customerid,req.params.id).then(function(_neworder){
			var _reqp=requestparameters.getPostParameters(req);
			var _json=new Buffer(_reqp['json'], 'base64').toString('ascii');
			var _params=JSON.parse(_json);
			var _tax=0;
			var _orderamount=_neworder.TotalAmount;
			var _totalamount=0;
			var _deliveryfree=6.99;
			var _tips=0;
			var _items=_params.items;

			if(parseFloat(_params.tips)){
				_tips=parseFloat(_params.tips);
			}

			var _taxAmount=0;
			var _totalAmounted=parseFloat(_orderamount+_taxAmount+_tips+_deliveryfree);
			_tax=math.round(_taxAmount,2);
			_totalamount=math.round(_totalAmounted,2);

			/*
			console.log(_taxAmount);
			console.log(_totalAmounted);

			console.log(_orderamount);
			console.log(_tax);
			console.log(_tips);
			console.log(_totalamount);
			*/

			gateway.transaction.sale({
			amount: _totalamount.toString(),
			taxAmount:_tax.toString(),
			purchaseOrderNumber:_neworder.name,
			orderId:req.params.id,
			paymentMethodNonce: _params.payment_none,
				options: {
					submitForSettlement: true
				}
			}, function (err, result) {
				if (result.success) {
					order.UpdateAsSettled(_neworder,_totalAmounted,_taxAmount,_tips,_params.payment_none,'success',_items).then(function(_order){
						res.json({rc:0,message:'order confirmed succesfully ',customer:_order.CustomerId,confirmation:_order.name,order:_order.id, totalamount:_totalamount});
					}).catch(function(error){
						console.log(error);
						res.json({rc:-1,message:'Error! Unable to process order'});
					});
				}else{
					console.log("Error! Unable to process payment for the given order");
					console.log(result.errors.errorCollections.transaction.validationErrors);
					console.log(result.errors.errorCollections.transaction.errorCollections);
					console.log(JSON.stringify(result.errors));
					res.json({rc:-1,message:'Error! Unable to process payment for the given order',err:result.errors});
/*
					order.UpdateAsSettled(_neworder,_totalamount,_tax,_tips,_params.payment_none,'failed',_items).then(function(_order){
						res.json({rc:-1,message:'Error! Unable to process given order',err:result.errors});
					}).catch(function(error){
						res.json({rc:-1,message:'Error! Unable to process given order'});
					});
*/
				}
			});

			/*
			gateway.transaction.submitForSettlement(_params.payment_none, function (err, result) {
				if(result.success){
					order.UpdateAsSettled(_neworder,_totalamount,_tax,_tips,_params.payment_none,"testing").then(function(_order){
						res.json({rc:0,message:'order confirmed succesfully ',customer:_order.CustomerId,confirmation:_order.name,order:_order.id,totalamountcharged:_totalamount});
					}).catch(function(error){
						res.json({rc:-1,message:'Error! Unable to process given order'});
					});
				}else{
					console.log(result.errors);
					res.json({rc:-1,message:'Error! Unable to process given order',errors:result.errors});
				}
			});


			order.UpdateAsSettled(_neworder,_totalamount,_tax,_tips,_params.payment_none,"testing").then(function(_order){
				res.json({rc:0,message:'order confirmed succesfully ',customer:_order.CustomerId,confirmation:_order.name,order:_order.id,totalamountcharged:_totalamount});
			}).catch(function(error){
				res.json({rc:-1,message:'Error! Unable to process given order'});
			});

			*/

		}).catch(function(error){
			console.log(error);
			res.json({rc:-1,message:'Error! we are unable to process given order'});
		});
    }).catch(function(error){
       res.json({rc:-1,message:'invalid user details 10'});
    });
})

.post('/store/api/orders/',function(req,res,next){
	 res.json({rc:-1,message:'this method is deprecated, please use order with customer id api'});
})

/*
** this method no more supported
.post('/store/api/orders/',function(req,res,next){
    var _reqp=requestparameters.getPostParameters(req);
    var _json=new Buffer(_reqp['json'], 'base64').toString('ascii');
    var _params=JSON.parse(_json);
    var _address=_params.customer.deliveryAddress;
    _address['email']=_params.customer.email;

    customer.create({
        name:_params.customer.name,
    }).then(function(_newcustomer){
        customer
            .addContact(_newcustomer,{
                        name:_params.customer.name,
                        isprimary:1,
                        isdeleted:0
            }).then(function(_contact){
            customer
                .addContactAddressBook(_contact,_address)
                .then(function(_newcustomeraddress){
                    var _orderparams={
                        CustomerId:_newcustomer.id,
                        name:_newcustomer.name.substr(0,_newcustomer.name.indexOf(','))+"-"+order.generate(5),
                        EmployeeId:0,
                        CustomerDeliveryAddressBookId:_newcustomeraddress.id,
                        CustomerBillingAddressBookId:_newcustomeraddress.id,
                        scheduleAt:_params.customer.scheduledate+" "+_params.customer.scheduletime,
                        deliveryAt:'9999-12-31',
                        status:'new',
                        isdeleted:0,
                        EmployeeSignatureImageId:0,
                        CustomerSignatureImageId:0,
                        VendorContactAddressBookId:0,
                        items:_params.items
                    };
                    order.create(_orderparams).then(function(_neworder){
                        res.json({rc:0,message:'order placed succesfully',customer:_newcustomer.id,order:_neworder.id});
                    });
                })
                .catch(function(err){

                    customer.destroy(_newcustomer).then(function(err){
                        res.json({rc:-1,message:'address details are not provided',order:[]});
                    }).catch(function(err){
                        res.json({rc:-1,message:'address details are not provided',order:[]});
                    });
                });

            }).catch(function(err){

                    customer.destroy(_newcustomer).then(function(err){
                        res.json({rc:-1,message:'address details are not provided',order:[]});
                    }).catch(function(err){
                        res.json({rc:-1,message:'address details are not provided',order:[]});
                    });
            });

    }).catch(function(err){
        res.json({rc:-1,message:'address details are not provided',order:[]});
    });
})
*/
.get('/store/api/orders/', function(req, res, next) {
    if(req.query.callback == undefined || req.query.token == undefined || req.query.from==undefined || req.query.to==undefined){
        res.status(404).send('Not found');
    }else{
        res.set('Content-Type', 'application/x-javascript');
        res.set('Expires', '0');
        user.auth({'authkey':req.query.token}).then(function(currentuser){
          order.get({from:req.query.from,to:req.query.to}).then(function(orders){
                var buff = new Buffer(JSON.stringify({rc:0,data:orders})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            }).catch(function(err){
                var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid details requested'})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            });
        }).catch(function(err){
            var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid user details 11'})).toString("base64");
            res.send(req.query.callback+'("'+buff+'")');
        })

    }
})
.get('/store/api/orders/:id/', function(req, res, next) {
    if(req.query.callback == undefined || req.query.token == undefined){
        res.status(404).send('Not found');
    }else{
        res.set('Content-Type', 'application/x-javascript');
        res.set('Expires', '0');
        user.auth({'authkey':req.query.token}).then(function(currentuser){
          order.getById({id:req.params.id}).then(function(orders){
                var buff = new Buffer(JSON.stringify({rc:0,data:orders})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            }).catch(function(err){
                var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid details requested'})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            });
        }).catch(function(err){
            var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid user details 12'})).toString("base64");
            res.send(req.query.callback+'("'+buff+'")');
        })

    }
})
.post('/store/orders/:orderid/vendor/:id/pickup/',function(req, res, next) {
  params=requestparameters.getPostParameters(req);
  if(params['token']==undefined || params['vendorsign']==undefined || params['empsign']==undefined){
      res.json({rc:-1,message:'invalid details posted'});
  }else{
    user.auth({'authkey':req.query.token}).then(function(currentuser){
        res.json({rc:0,message:'received succesfully'});
    }).catch(function(err){
        res.json({rc:-1,message:'invalid user details 13'});
    });
  }
})
.post('/api/orders/:orderid/delivery/', function(req, res, next) {
  params=requestparameters.getPostParameters(req);
  if(params['token']==undefined || params['customersign']==undefined || params['empsign']==undefined){
      res.json({rc:-1,message:'invalid details posted'});
  }else{
    user.auth({'authkey':req.query.token}).then(function(currentuser){
        res.json({rc:0,message:'received succesfully'});
    }).catch(function(err){
        res.json({rc:-1,message:'invalid user details 14'});
    });
  }
})
.post('/store/api/customer/',function(req,res,next){

    var _reqp=requestparameters.getPostParameters(req);
    var _json=new Buffer(_reqp['json'], 'base64').toString('ascii');
    var _params=JSON.parse(_json);
    var _password=(_params.customer.password)?_params.customer.password:"guest";

    customer.register({
        name:_params.customer.name,
		password:_params.customer.password,
		email:_params.customer.email
    }).then(function(_newcustomer){
		res.json({rc:0,message:'welcome',id:_newcustomer.parentId,authkey:_newcustomer.authkey});
    }).catch(function(err){
        res.json({rc:-1,message:err});
    });
})
.get('/app/api/orders/', function(req, res, next) {
    if(req.query.callback == undefined || req.query.token == undefined || req.query.from==undefined || req.query.to==undefined){
        res.status(404).send('Not found');
    }else{
        res.set('Content-Type', 'application/x-javascript');
        res.set('Expires', '0');
        user.auth({'authkey':req.query.token}).then(function(currentuser){
          order.get({from:req.query.from,to:req.query.to}).then(function(orders){
                var buff = new Buffer(JSON.stringify({rc:0,data:orders})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            }).catch(function(err){
                var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid details requested'})).toString("base64");
                res.send(req.query.callback+'("'+buff+'")');
            });
        }).catch(function(err){
            var buff = new Buffer(JSON.stringify({rc:-1,message:'invalid user details 15'})).toString("base64");
            res.send(req.query.callback+'("'+buff+'")');
        })

    }
})
.get('/store/api/vendors/', function(req, res, next) {
    //req.query.street == undefined || req.query.city == undefined || req.query.state==undefined
    if(req.query.zipcode==undefined){
        res.status(404).json({rc:-1,message:'zipcode not provided'});
    }else{
		try{
		  request('https://maps.googleapis.com/maps/api/geocode/json?address='+req.query.zipcode, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
					var data=JSON.parse(body);
					data=JSON.parse(body);
					if(data && data['results']){
						if(data['results'].length >0){
							if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
								if(data.results[0]['geometry']['location']){
									var _requestedaddress=data.results[0].formatted_address;
									vendor.getVendorsForAPI({ lat: data.results[0].geometry.location.lat,lng: data.results[0].geometry.location.lng}).then(function(vendors){
										res.json({rc:0,vendors:vendors,requestedaddress:{address:_requestedaddress}});
									}).catch(function(err){
										res.json({rc:-1,message:'invalid details requested',err:err});
									});
								}
							}
						}
					}
			  }else{
				//res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
				res.status(404).json({rc:-1,message:'service not avaliable !!!'});
			  }
		  });
		}catch(error){
			console.log(error);
			res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
		}


	}
})
.get('/store/api/kiranmath',function(req, res, next) {
			var _taxAmount=parseFloat(3.98*0.075);
			var _totalAmounted=parseFloat(4.56+_taxAmount+2+1.0);
			var _tax=math.round(_taxAmount,2);
			var _totalamount=math.round(_totalAmounted,2);
			console.log(_taxAmount);
			console.log(_totalAmounted);

			console.log(_tax);
			console.log(_totalamount);
			res.status(200).json({rc:-1,message:'service not avaliable due to internal error occurred '});

});

;


module.exports = router;
