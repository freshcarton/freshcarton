/**
 * Created by talapaku on 12/7/2015.
 */

'use strict';

var express = require('express');
var path = require('path');
var url = require('url');
var requestparameters=require('../bin/requestparameters.js');
var request = require('request');
var dateutil = require('../bin/date.js');
var multer = require('multer');
var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, '/home/ec2-user/apps/CRM/tmp/uploads/');
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
  }
});

var upload = multer({
  storage: storage
}).single('file');


/** routers & controllers **/
var user=require('../controllers/user.js');
var employee=require('../controllers/employee.js');
var customer=require('../controllers/customer.js');
var vendor=require('../controllers/vendor.js');
var market=require('../controllers/market.js');
var order=require('../controllers/order.js');
var product=require('../controllers/product.js');
var inventory=require('../controllers/inventory.js');

var webapprouter = express.Router();

webapprouter
.all('/webapp/*',function(req,res,next){
	if (req.method === 'OPTIONS') {
		  console.log('!OPTIONS');
		  var headers = {};
		  // IE8 does not allow domains to be specified, just the *
		  // headers["Access-Control-Allow-Origin"] = req.headers.origin;
		  headers["Access-Control-Allow-Origin"] = "*";
		  headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
		  headers["Access-Control-Allow-Credentials"] = false;
		  headers["Access-Control-Max-Age"] = '86400'; // 24 hours
		  headers["Access-Control-Allow-Headers"] = "X-HTTP-Method-Override, Content-Type, Accept,Origin, X-Requested-With, Content-Type, Accept,x-session-token,Pragma,Cache-Control,If-Modified-Since";
		  res.writeHead(200, headers);
		  res.end();
	}else{
		next();
	}
})
.get('/webapp/login/',function(req, res, next) {
  user.login(requestparameters.getBasicAuthDetais(req)).then(function(result){
    res.json({rc:0,message:'welcome',data:{id: result.id, authkey:result.authkey,type:result.parentType}});
  }).catch(function(err){
    res.json({rc:-1,message:'invalid user details'});
  });
})
.post('/webapp/login/',function(req, res, next) {
  var params=requestparameters.getPostParameters(req);
  if(params['email']==undefined && params['username'] == undefined){
  	 res.json({rc:-1,message:'invalid user details'});
      return;
  }else if(params['username']){
  	 params['email']=params['username']
  }
  if(params['hashkey']==undefined && params['password'] == undefined){
  	 res.json({rc:-1,message:'invalid user details'});
      return;
  }else if(params['password']){
  	 params['hashkey']=params['password']
  }
  user.login(params).then(function(result){
    res.json({rc:0,message:'welcome',data:{id: result.id, authkey:result.authkey,type:result.parentType}});
  }).catch(function(err){
    console.log(err);
    res.json({rc:-1,message:'invalid user details x'});
  });
})
.all('/webapp/users/*',function(req,res,next){
	user.auth({'authkey':req.headers['x-session-token']}).then(function(currentuser){
		req.currentuser=currentuser;
		next();
	}).catch(function(){
		res.status(404).send('invalid user details');
	});
})
.all('/webapp/orders/*',function(req,res,next){
    user.auth({'authkey':req.headers['x-session-token']}).then(function(currentuser){
        req.currentuser=currentuser;
        next();
    }).catch(function(){
        res.status(404).send('invalid user details');
    });
})
.all('/webapp/vendors/*',function(req,res,next){
    user.auth({'authkey':req.headers['x-session-token']}).then(function(currentuser){
        req.currentuser=currentuser;
        next();
    }).catch(function(){
        res.status(404).send('invalid user details');
    });
})
.all('/webapp/markets/*',function(req,res,next){
    user.auth({'authkey':req.headers['x-session-token']}).then(function(currentuser){
        req.currentuser=currentuser;
        next();
    }).catch(function(){
        res.status(404).send('invalid user details');
    });
})
.all('/webapp/products/*',function(req,res,next){
    user.auth({'authkey':req.headers['x-session-token']}).then(function(currentuser){
        req.currentuser=currentuser;
        if(req.currentuser.parentType=='Employee'){
            res.status(404).send('invalid request');
        }else{
            next();
        }
    }).catch(function(){
        res.status(404).send('invalid user details');
    });
})
.get('/webapp/user/:id/',function(req,res,next){
	user.auth({'authkey':req.query.token}).then(function(currentuser){
			if(currentuser.id==req.params.id && currentuser.parentType=='Employee'){
				user.getEmployee({'id':req.params.id}).then(function(_user){
					res.json({rc:0,details:{'name':_user.Employee.name,'email':_user.email,'id':_user.parentId,'type':_user.parentType},menuoptions:[{title:"orders",icon:"shopping_cart"}]});
				});
			}else if(currentuser.id==req.params.id && currentuser.parentType=='Vendor'){
				user.getVendor({'id':req.params.id}).then(function(_user){
					res.json({rc:0,details:{'name':_user.Employee.name,'email':_user.email,'id':_user.parentId,'type':_user.parentType},menuoptions:[{title:"orders",icon:"shopping_cart"}]});
				});

			}else if(currentuser.id==req.params.id && currentuser.parentType=='admin'){
				user.getEmployee({'id':req.params.id}).then(function(_user){
					res.json({rc:0,details:{'name':_user.Employee.name,'email':_user.email,'id':_user.parentId,'type':_user.parentType},menuoptions:[{title:"customers",icon:"person"},{title:"employees",icon:"local_shipping"},{title:"vendors",icon:"business"},{title:"products",icon:"store_mall_directory"},{title:"orders",icon:"shopping_cart"}]});
				});
			}else{
				res.status(404).send('invalid user details');
			}
	});
	/*
    user.get({authkey:req.query.token}).then(function(user){
			if(user.parentType=='Employee'){
				res.json({rc:0,data:user,menuoptions:[{title:"orders",icon:"shopping_cart"}]});
			}else if(user.parentType=='Vendor'){
				res.json({rc:0,data:user,menuoptions:[{title:"products",icon:"store_mall_directory"},{title:"orders",icon:"shopping_cart"}]});
			}else if(user.parentType=='admin'){
				res.json({rc:0,data:user,menuoptions:[{title:"customers",icon:"person"},{title:"employees",icon:"local_shipping"},{title:"vendors",icon:"business"},{title:"products",icon:"store_mall_directory"},{title:"orders",icon:"shopping_cart"}]});
			}else{
				res.status(404).send('invalid user details');
			}
    }).catch(function(error){
       res.json({rc:-1,message:'invalid user details'});
    });
	*/
})
.get('/webapp/user/dashboard/',function(req,res,next){
  res.status(404).json({rc:-1,message:"invalid request"});
})
.get('/webapp/orders/',function(req,res,next){

  var _now=dateutil.now();
  var _from=dateutil.getFormatDate(dateutil.addDays(_now,-30));
  var _to=dateutil.getFormatDate(dateutil.addDays(_now,30));
  if(req.query.offset){
     var _o=parseInt(req.query.offset);
      if(_o>0){
        _from=dateutil.getFormatDate(dateutil.addDays(_now,_o*-1));
        _to=dateutil.getFormatDate(dateutil.addDays(_now,_o));
      }else{
        _from=dateutil.getFormatDate(dateutil.addDays(_now,_o));
        _to=dateutil.getFormatDate(dateutil.addDays(_now,_o*-1));
      }
  }

  if(req.currentuser.parentType=='Employee'){
        order.getByEmployeeID({
            from: _from,
            to:_to,
            id:req.currentuser.parentId
        }).then(function(orders){
          res.json({rc:0,data:orders});
        });
    }else if(req.currentuser.parentType=='Vendor'){
        order.getByVendorId({
            from: _from,
            to:_to,
            id:req.currentuser.parentId
        }).then(function(orders){
          res.json({rc:0,data:orders});
        });
    }else if(req.currentuser.parentType=='admin'){
        order.get({
            from: _from,
            to:_to
        }).then(function(orders){
          res.json({rc:0,data:orders});
        });
    }else{
        res.status(500).send('invalid request');
    }
})
.get('/webapp/orders/dashboard/',function(req,res,next){
    res.status(404).json({rc:-1,message:"invalid request"});
    // order.getStatusCount(req.currentuser).then(function(orders){
    //   res.json({rc:0,data:orders});
    // }).catch(function(error){
    //   console.log(error);
    //   res.send(500).json({rc:-1,message:"invalid request"});
    // });
})
.get('/webapp/orders/:id',function(req,res,next){
//  order.getById({id:req.params.id}).then(function(order){
//    res.json({rc:0,data:order});
//  });
  if(req.currentuser.parentType=='Employee'){
        order.getById({id:req.params.id,EmployeeId:req.currentuser.parentId}).then(function(order){
          res.json({rc:0,data:order});
        });
    }else if(req.currentuser.parentType=='Vendor'){
        order.getById({id:req.params.id,VendorId:req.currentuser.parentId}).then(function(order){
          res.json({rc:0,data:order});
        });
    }else if(req.currentuser.parentType=='admin'){
        order.getById({
            id:req.params.id
        }).then(function(orders){
          res.json({rc:0,data:orders});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.put('/webapp/orders/:id/reject',function(req,res,next){
  if(req.currentuser.parentType=='Vendor'){
        order.UpdateOrderStatusFromVendor({
            OrderId:req.params.id,
            VendorId:req.currentuser.parentId,
            status:'rejected'
        }).then(function(affectedrows){
          res.json({rc:0,data:"rejected"});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.put('/webapp/orders/:id/confirm',function(req,res,next){
  if(req.currentuser.parentType=='Vendor'){
        order.UpdateOrderStatusFromVendor({
            OrderId:req.params.id,
            VendorId:req.currentuser.parentId,
            status:'confirmed'
        }).then(function(affectedrows){
          res.json({rc:0,data:"confirmed"});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.put('/webapp/orders/:id/ready',function(req,res,next){
  if(req.currentuser.parentType=='Vendor'){
        order.UpdateOrderStatusFromVendor({
            OrderId:req.params.id,
            VendorId:req.currentuser.parentId,
            status:'ready'
        }).then(function(affectedrows){
          res.json({rc:0,data:"confirmed"});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.get('/webapp/orders/vendors/:id',function(req,res,next){
  order.getByVendorId({id:req.params.id}).then(function(orders){
    res.json({rc:0,data:orders});
  });
})
.get('/webapp/orders/customers/:id',function(req,res,next){
  order.getByCustomerId({customerid:req.params.id}).then(function(orders){
    res.json({rc:0,data:orders});
  });
})
.get('/webapp/orders/employees/:id',function(req,res,next){
  var _now=dateutil.now();
  var _from=dateutil.getFormatDate(_now,-30);
  var _to=dateutil.getFormatDate(dateutil.addDays(_now,30));
        order.getByEmployeeID({
            from: '01/01/2015',
            to:_to,
            id:req.params.id
        }).then(function(orders){
          res.json({rc:0,data:orders});
        });
})
.get('/webapp/products/',function(req,res,next){
    if(req.currentuser.parentType=='Vendor'){
        product.getByVendor(req.currentuser.parentId).then(function(products){
          res.json({rc:0,data:products});
        }).catch(function(err){
          console.log(err);
          res.json({rc:-1,message:err.message,data:{}});
        });
    }else if(req.currentuser.parentType=='admin'){
        product.get().then(function(products){
          res.json({rc:0,data:products});
        }).catch(function(err){
          console.log(err);
          res.json({rc:-1,message:err.message,data:{}});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.get('/webapp/products/vendors/:id',function(req,res,next){
    if(req.currentuser.parentType=='Vendor' || req.currentuser.parentType=='admin' || req.currentuser.parentId==req.params.id){
        product.getByVendor(req.params.id).then(function(products){
          res.json({rc:0,data:products});
        }).catch(function(err){
          console.log(err);
          res.json({rc:-1,message:err.message,data:{}});
        });
    }else{
        res.status(404).send('invalid request');
    }
})
.get('/webapp/products/:id/',function(req,res,next){
  product.getById(req.params.id).then(function(products){
    res.json({rc:0,data:products});
  }).catch(function(err){
    res.json({rc:-1,message:'no product found',error:err.message});
  });
})
.delete('/webapp/products/:id',function(req,res,next){
  product.delete(req.params.id).then(function(product){
    res.json({rc:0,data:product});
  });
})
.put('/webapp/products/:id',function(req,res,next){
  product.update(req.params.id,requestparameters.getPostParameters(req)).then(function(result){
    result=requestparameters.getPostParameters(req);
    result['updatedAt']=new Date().toISOString();
      res.json({rc:0,data:result,message:'product details are updated'});
  }).catch(function(err){
    console.log(err);
    res.json({rc:-1,message:'error occurred while updating product',details:err.message});
  });
})
.post('/webapp/products/',function(req,res,next){
	var _id=req.currentuser.parentId;
	if(req.currentuser.parentType=='admin')
	{
		_id=req.params.id;
	}
    vendor.addProduct(_id,
        requestparameters.getPostParameters(req)
    ).then(function(_newproduct){
        res.json({rc:0,data:_newproduct});
    }).catch(function(err){
      res.json({rc:-1,message:'few product details are not provided',details:err});
    });
})
.post('/webapp/vendors/:id/products/',function(req,res,next){
	var _id=req.currentuser.parentId;
	if(req.currentuser.parentType=='admin')
	{
		_id=req.params.id;
	}
  console.log(requestparameters.getPostParameters(req));
    vendor.addProduct(_id,
        requestparameters.getPostParameters(req)
    ).then(function(_newproduct){
        res.json({rc:0,data:_newproduct});
    }).catch(function(err){
      res.json({rc:-1,message:'few product details are not provided',details:err});
    });
})
.post('/webapp/products/:id/upload/',function(req,res,next){
  upload(req,res,function(err){
    if(err){
      console.log(err);
      res.json({rc:-1,message:"error occured while upoading"});
      return;
    }
    product.uploadImage(req.params.id,req.file).then(function(image){
      res.json({rc:0,message:"Success",location:"/tmp/uploads/"+image.filename});
    }).catch(function(err){
      res.json({rc:-1,message:'Unable to add image to the given product',details:err});
    });
  });
})
.get('/webapp/products/:id/inventory/',function(req,res,next){
    inventory.getByProduct(req.params.id,
      requestparameters.getPostParameters(req)
    ).then(function(_new){
      res.json({rc:0,data:_new});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'few Inventory details are not provided',details:err});
    });
})
.post('/webapp/products/:id/inventory/',function(req,res,next){
  product.getById(req.params.id).then(function(product){
    inventory.create(product,
      requestparameters.getPostParameters(req)
    ).then(function(_new){
      res.json({rc:0,data:_new});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'few Inventory details are not provided',details:err});
    });
  }).catch(function(err){
    res.json({rc:-1,message:'no product found'});
  });

})
.put('/webapp/products/:productid/inventory/:id',function(req,res,next){
    inventory.update(req.params.productid,req.params.id,
      requestparameters.getPostParameters(req)
    ).then(function(affectedRows){
      res.json({rc:0,message:"Inventory updated"});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'few Inventory details are not provided',details:err});
    });
})
//--
.get('/webapp/products/:id/recommendations/',function(req,res,next){
    product.getRecommendation(req.params.id,
      requestparameters.getPostParameters(req)
    ).then(function(recommendations){
      res.json({rc:0,data:recommendations});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'Product Recommendation Is not found',data:[],details:err});
    });
})
.post('/webapp/products/:id/recommendations/',function(req,res,next){
    var params=requestparameters.getPostParameters(req);
    console.log(params);
    product.addRecommendation(req.params.id,params.targetid).then(function(recommendations){
      res.json({rc:0,data:recommendations});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'Product Recommendation not able to add',data:[],details:err});
    });
})
.delete('/webapp/products/:productid/recommendations/:id',function(req,res,next){
    var params=requestparameters.getPostParameters(req);
    product.deleteRecommendation(req.params.id,params.targetid).then(function(recommendations){
      res.json({rc:0,data:recommendations});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'Product Recommendation not able to update',data:[],details:err});
    });
})
//--
.post('/webapp/location/', function(req, res, next) {
	var _params=requestparameters.getPostParameters(req);
    if(_params.street == undefined || _params.city == undefined || _params.state==undefined ){
        res.status(404).send('Not found');
    }else{
		try{
		  request('https://maps.googleapis.com/maps/api/geocode/json?address='+_params.zipcode, function (error, response, body) {
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
.get('/webapp/vendors/',function(req,res,next){
  vendor.get().then(function(vendors){
    res.json({rc:0,data:vendors});
  });
})
.post('/webapp/vendors/',function(req,res,next){
    var newvendorid=0;
    var params=requestparameters.getPostParameters(req);
	try{
    params.street=params.addressline1+" "+params.addressline2;
    console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				var data=JSON.parse(body);
				data=JSON.parse(body);
				if(data && data['results']){
					if(data['results'].length >0){

						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
							if(data.results[0]['geometry']['location']){
                console.log(data.results[0]);
								var _requestedaddress=data.results[0].formatted_address;
								var ll=data.results[0].address_components.length-1;
								params.latitude=data.results[0].geometry.location.lat;
								params.longitude=data.results[0].geometry.location.lng
								params.zipcode=data.results[0].address_components[ll].long_name;
                params.addressline1=params.addressline1;
                params.addressline2=params.addressline2;
								params.formattedaddress=data.results[0].formatted_address;
								params.isprimary=1;

								vendor.create({
									name:params.name
								}).then(function(_newvendor){
									newvendorid=_newvendor.id;
									vendor.addContact(_newvendor,{
									  name:params.contactname,
									  isprimary:1
									}).then(function(_newvendorcontact){
										vendor.addContactAddressBook(_newvendorcontact,params).then(function(_newvendorcontact){
										  res.json({rc:0,message:'success vendor is addedd',VendorId:newvendorid});
										}).catch(function(err){
										  vendor.destory(_newvendor).then(function(err) {
											res.json({rc: -1, message: "Please Enter Valid Address", details: err.message});
										  });
										});
									}).catch(function(err){
									  vendor.destory(_newvendorcontact).then(function(err){
										res.json({rc:-1,message:'Valid Contact Name is not provided',details:err.message});
									  });
									})
								}).catch(function(err){
								  res.json({rc:-1,message:'Valid Vendor Name is not provided',details:err.message});
								});

							}
						}
					}
				}
		  }else{
			//res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
			res.status(500).json({rc:-1,message:'service not avaliable !!!'});
		  }
		});
	}catch(error){
		console.log(error);
		res.status(500).json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
})
.get('/webapp/vendors/:id/',function(req,res,next){
  vendor.getById(req.params.id).then(function(vendors){
    res.json({rc:0,data:vendors});
  }).catch(function(err){
    res.json({rc:-1,message:'no vendor found',details:err.message});
  });
})
.put('/webapp/vendors/:id/disable',function(req,res,next){
  vendor.disable(req.params.id).then(function(vendor){
    res.json({rc:0,data:vendor});
  });
})
.put('/webapp/vendors/:id/enable',function(req,res,next){
  vendor.enable(req.params.id).then(function(vendor){
    res.json({rc:0,data:vendor});
  });
})
.put('/webapp/vendors/:id',function(req,res,next){
  var params=requestparameters.getPostParameters(req);
  try{
    params.street=params.addressline1+" "+params.addressline2;
    console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				var data=JSON.parse(body);
				data=JSON.parse(body);
				if(data && data['results']){
					if(data['results'].length >0){
						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
							if(data.results[0]['geometry']['location']){
								var _requestedaddress=data.results[0].formatted_address;
								var ll=data.results[0].address_components.length-1;
								params.latitude=data.results[0].geometry.location.lat;
								params.longitude=data.results[0].geometry.location.lng
								params.zipcode=data.results[0].address_components[ll].long_name;
                params.addressline1=params.addressline1;
                params.addressline2=params.addressline2;
								params.formattedaddress=data.results[0].formatted_address;
								params.isprimary=1;
								vendor.update(req.params.id,{
									name:params.name
								}).then(function(rv){
                vendor.updateContact(req.params.id,params.ContactId,{name:params.ContactName}).then(function(rcc){
                    vendor.updateContactAddressBook(params.ContactId,params.ContactAddressBookId,params).then(function(acc){
                      res.json({rc:0,message:'success vendor is upated'});
                    }).catch(function(err){
                      res.json({rc:-3,message:'error vendor address not upated'});
                    });
                }).catch(function(err){
                  res.json({rc:-2,message:'error vendor contact/address not upated'});
                });
                  /*
									newvendorid=_newvendor.id;
									vendor.addContact(_newvendor,{
									  name:params.contactname,
									  isprimary:1
									}).then(function(_newvendorcontact){
										vendor.addContactAddressBook(_newvendorcontact,params).then(function(_newvendorcontact){
										  res.json({rc:0,message:'success vendor is addedd',VendorId:newvendorid});
										}).catch(function(err){
										  vendor.destory(_newvendor).then(function(err) {
											res.json({rc: -1, message: "Please Enter Valid Address", details: err.message});
										  });
										});
									}).catch(function(err){
									  vendor.destory(_newvendorcontact).then(function(err){
										res.json({rc:-1,message:'Valid Contact Name is not provided',details:err.message});
									  });
									})
                  */
								}).catch(function(err){
								  res.json({rc:-1,message:'Valid Vendor Name is not provided',details:err.message});
								});

							}
						}
					}
				}
		  }else{
			//res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
			res.status(500).json({rc:-1,message:'service not avaliable !!!'});
		  }
		});
	}catch(error){
		console.log(error);
		res.status(500).json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
  /*
  vendor.update(req.params.id,params).then(function(result){
    res.json({rc:0,message:'vendor details are updated',details:result});
  }).catch(function(err){
    console.log(err);
    res.json({rc:-1,message:'error occurred while updating vendor',details:err.message});
  });
  */
})

.get('/webapp/employees/',function(req,res,next){
  employee.get().then(function(employees){
    res.json({rc:0,data:employees});
  });
})
.post('/webapp/employees/',function(req,res,next){
    var newemployeeid=0;
    var params=requestparameters.getPostParameters(req);
    try{
      params.street=params.addressline1+" "+params.addressline2;
      console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
  	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
  		  if (!error && response.statusCode == 200) {
  				var data=JSON.parse(body);
  				data=JSON.parse(body);
  				if(data && data['results']){
  					if(data['results'].length >0){
  						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
  							if(data.results[0]['geometry']['location']){
  								var _requestedaddress=data.results[0].formatted_address;
  								var ll=data.results[0].address_components.length-1;
  								params.latitude=data.results[0].geometry.location.lat;
  								params.longitude=data.results[0].geometry.location.lng
  								params.zipcode=data.results[0].address_components[ll].long_name;
                  params.addressline1=params.addressline1;
                  params.addressline2=params.addressline2;
  								params.formattedaddress=data.results[0].formatted_address;
                  params.isprimary=1;
                  params.doj=dateutil.now();
                  params.dob=dateutil.now();
                  params.password="welcome";
                  console.log(params);
                  employee.create(params).then(function(_newemployee){
                    newemployeeid=_newemployee.id;
                    console.log(newemployeeid);
                    res.json({rc:0,message:'success employee is added',EmployeeId:newemployeeid});
                  }).catch(function(err){
                    console.log(err);
                    res.json({rc:-1,message:'Valid Employee Details is not provided',details:err.message});
                  });
							}
						}
					}
				}
		  }else{
           console.log(error);
			     res.json({rc:-1,message:'service not avaliable !!!'});
		  }
      //res.json({rc:-1,message:'service not avaliable !!!'});
		});
	}catch(error){
		console.log(error);
		res.json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
  //res.json({rc:-1,message:'service not avaliable !!!'});
})
.put('/webapp/employees/:id/',function(req,res,next){
    var newemployeeid=0;
    var params=requestparameters.getPostParameters(req);
    try{
      params.street=params.addressline1+" "+params.addressline2;
      console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
  	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
  		  if (!error && response.statusCode == 200) {
  				var data=JSON.parse(body);
  				data=JSON.parse(body);
  				if(data && data['results']){
  					if(data['results'].length >0){
  						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
  							if(data.results[0]['geometry']['location']){
  								var _requestedaddress=data.results[0].formatted_address;
  								var ll=data.results[0].address_components.length-1;
  								params.latitude=data.results[0].geometry.location.lat;
  								params.longitude=data.results[0].geometry.location.lng
  								params.zipcode=data.results[0].address_components[ll].long_name;
                  params.addressline1=params.addressline1;
                  params.addressline2=params.addressline2;
  								params.formattedaddress=data.results[0].formatted_address;
                  params.isprimary=1;
                  params.doj=dateutil.now();
                  params.dob=dateutil.now();
                  employee.update(req.params.id,params).then(function(_newemployee){
                    employee.updateEmployeeAddressBook(req.params.id,params.EmployeeAddressBookId,params).then(function(_newemployeecontact){
                      res.json({rc:0,message:'success employee is updated'});
                    }).catch(function(err){
                      var _err=err;
                      console.log(err);
                      res.json({rc: -1, message: "Error employee is not updated", details: _err.message});
                    });
                  }).catch(function(err){
                    res.json({rc:-1,message:'Valid Employee Details is not provided',details:err.message});
                  });
							}
						}
					}
				}
		  }else{
			     res.json({rc:-1,message:'service not avaliable !!!'});
		  }
		});
	}catch(error){
		res.json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
})
.post('/webapp/employees/:id/upload/',function(req,res,next){
  upload(req,res,function(err){
    if(err){
      console.log(err);
      res.json({rc:-1,message:"error occured while upoading"});
      return;
    }
    employee.uploadImage(req.params.id,req.file).then(function(image){
      res.json({rc:0,message:"Success",location:"/tmp/uploads/"+image.filename});
    }).catch(function(err){
      res.json({rc:-1,message:'Unable to add image to the given employee',details:err});
    });
  });
})
.get('/webapp/employees/:id',function(req,res,next){
  employee.getById(req.params.id).then(function(employee){
    res.json({rc:0,data:employee});
  });
})
.put('/webapp/employees/:id/disable',function(req,res,next){
  employee.disable(req.params.id).then(function(employee){
    res.json({rc:0,data:employee});
  });
})
.put('/webapp/employees/:id/enable',function(req,res,next){
  employee.enable(req.params.id).then(function(employee){
    res.json({rc:0,data:employee});
  });
})
.get('/webapp/customers/',function(req,res,next){
  customer.get().then(function(customers){
    res.json({rc:0,data:customers});
  });
})
.get('/webapp/customers/:id',function(req,res,next){
  customer.getById(req.params.id).then(function(customer){
    res.json({rc:0,data:customer});
  });
})
.get('/webapp/markets/',function(req,res,next){
  market.get().then(function(markets){
    res.json({rc:0,data:markets});
  });
})
.get('/webapp/markets.json',function(req,res,next){
  market.getBasicOnly().then(function(markets){
    res.json({rc:0,data:markets});
  });
})
.post('/webapp/markets/',function(req,res,next){
    var newmarketid=0;
    var params=requestparameters.getPostParameters(req);
	try{
    params.street=params.addressline1+" "+params.addressline2;
    console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				var data=JSON.parse(body);
				data=JSON.parse(body);
				if(data && data['results']){
					if(data['results'].length >0){

						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
							if(data.results[0]['geometry']['location']){
                console.log(data.results[0]);
								var _requestedaddress=data.results[0].formatted_address;
								var ll=data.results[0].address_components.length-1;
								params.latitude=data.results[0].geometry.location.lat;
								params.longitude=data.results[0].geometry.location.lng
								params.zipcode=params.zipcode;
                params.addressline1=params.addressline1;
                params.addressline2=params.addressline2;
								params.formattedaddress=data.results[0].formatted_address;
								params.isprimary=1;

								market.create({
									name:params.name
								}).then(function(_newmarket){
									newmarketid=_newmarket.id;
									market.addContact(_newmarket,{
									  name:params.contactname,
									  isprimary:1
									}).then(function(_newmarketcontact){
										market.addAddressBook(_newmarket,params).then(function(_newmarketaddress){
										  res.json({rc:0,message:'success market is addedd',MarketId:newmarketid});
										}).catch(function(err){
										  market.destory(_newmarket).then(function(err) {
											res.json({rc: -1, message: "Please Enter Valid Address", details: err.message});
										  });
										});
									}).catch(function(err){
									  market.destory(_newmarketcontact).then(function(err){
										res.json({rc:-1,message:'Valid Contact Name is not provided',details:err.message});
									  });
									})
								}).catch(function(err){
								  res.json({rc:-1,message:'Valid Market Name is not provided',details:err.message});
								});

							}
						}
					}
				}
		  }else{
			//res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
			res.status(500).json({rc:-1,message:'service not avaliable !!!'});
		  }
		});
	}catch(error){
		console.log(error);
		res.status(500).json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
})
.get('/webapp/markets/:id/vendors/',function(req,res,next){
  vendor.get().then(function(vendor){
    res.json({rc:0,data:vendor});
  }).catch(function(err){
    res.json({rc:-1,message:'no market found',details:err.message});
  });
})
.get('/webapp/markets/:id/',function(req,res,next){
  market.getById(req.params.id).then(function(markets){
    res.json({rc:0,data:markets});
  }).catch(function(err){
    res.json({rc:-1,message:'no market found',details:err.message});
  });
})
.put('/webapp/markets/:id/disable',function(req,res,next){
  market.disable(req.params.id).then(function(market){
    res.json({rc:0,data:market});
  });
})
.put('/webapp/markets/:id/enable',function(req,res,next){
  market.enable(req.params.id).then(function(market){
    res.json({rc:0,data:market});
  });
})
.put('/webapp/markets/:id',function(req,res,next){
  var params=requestparameters.getPostParameters(req);
  try{
    params.street=params.addressline1+" "+params.addressline2;
    console.log('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode);
	  request('https://maps.googleapis.com/maps/api/geocode/json?address='+params.zipcode, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				var data=JSON.parse(body);
				data=JSON.parse(body);
				if(data && data['results']){
					if(data['results'].length >0){
						if(data.results[0]['geometry'] && data.results[0]['formatted_address']){
							if(data.results[0]['geometry']['location']){
								var _requestedaddress=data.results[0].formatted_address;
								var ll=data.results[0].address_components.length-1;
								params.latitude=data.results[0].geometry.location.lat;
								params.longitude=data.results[0].geometry.location.lng
								params.zipcode=data.results[0].address_components[ll].long_name;
                params.addressline1=params.addressline1;
                params.addressline2=params.addressline2;
								params.formattedaddress=data.results[0].formatted_address;
								params.isprimary=1;
								market.update(req.params.id,{
									name:params.name
								}).then(function(rv){
                market.updateContact(req.params.id,params.ContactId,{name:params.ContactName}).then(function(rcc){
                    market.updateContactAddressBook(params.ContactId,params.ContactAddressBookId,params).then(function(acc){
                      res.json({rc:0,message:'success market is upated'});
                    }).catch(function(err){
                      res.json({rc:-3,message:'error market address not upated'});
                    });
                }).catch(function(err){
                  res.json({rc:-2,message:'error market contact/address not upated'});
                });
                  /*
									newmarketid=_newmarket.id;
									market.addContact(_newmarket,{
									  name:params.contactname,
									  isprimary:1
									}).then(function(_newmarketcontact){
										market.addContactAddressBook(_newmarketcontact,params).then(function(_newmarketcontact){
										  res.json({rc:0,message:'success market is addedd',MarketId:newmarketid});
										}).catch(function(err){
										  market.destory(_newmarket).then(function(err) {
											res.json({rc: -1, message: "Please Enter Valid Address", details: err.message});
										  });
										});
									}).catch(function(err){
									  market.destory(_newmarketcontact).then(function(err){
										res.json({rc:-1,message:'Valid Contact Name is not provided',details:err.message});
									  });
									})
                  */
								}).catch(function(err){
								  res.json({rc:-1,message:'Valid Market Name is not provided',details:err.message});
								});

							}
						}
					}
				}
		  }else{
			//res.status(404).json({rc:-1,message:'service not avaliable due to internal error occurred '});
			res.status(500).json({rc:-1,message:'service not avaliable !!!'});
		  }
		});
	}catch(error){
		console.log(error);
		res.status(500).json({rc:-1,message:'service not avaliable due to internal error occurred '});
	}
  /*
  market.update(req.params.id,params).then(function(result){
    res.json({rc:0,message:'market details are updated',details:result});
  }).catch(function(err){
    console.log(err);
    res.json({rc:-1,message:'error occurred while updating market',details:err.message});
  });
  */
  })
  .post('/webapp/markets/:id/vendors/:vendorid',function(req,res,next){
    var params=requestparameters.getPostParameters(req);
    market.addVendor(req.params.id,req.params.vendorid).then(function(market){
      res.json({rc:0,data:{MarketId:market.MarketId,VendorId:market.VendorId}});
    }).catch(function(err){
      console.log(err);
      res.json({rc:-1,message:'error occurred while updating market',details:err.message});
    });
  })
  .put('/webapp/markets/:id/vendors/:vendorid',function(req,res,next){
    var params=requestparameters.getPostParameters(req);
      market.updateVendor(req.params.id,params.oldmarketid,req.params.vendorid).then(function(market){
        res.json({rc:0,data:{MarketId:req.params.id,VendorId:req.params.vendorid}});
      }).catch(function(err){
         console.log(err);
        res.json({rc:-1,message:'error occurred while updating market',details:err.message});
      });
  })
;
module.exports = webapprouter;
