angular.module('store.services', [])
.factory('$userservice',function($rootScope,$restservice,CacheFactory){
    var self=this;
    self.get=function(){
        return self.cache.get('/user');
    };
    self.put=function(id,token,type){
        self.cache.put('/user',{id:id,token:token,usertype:type});
    };
    self.remove=function(){
    	self.cache.removeAll();
        self.cache.put('/user',{id:undefined,token:undefined,usertype:undefined});
    };
    self.login=function(entity){
        return $restservice.post('login',entity);
    };
    self.save=function(path,params){
        var u=self.get();
        if(u['id']){
           self.cache.put('user/'+u['id']+'/'+path,params);
           return true;
        }
        return false;
    };
    self.fetch=function(path){
        var u=self.get();
        if(u['id']){
           return self.cache.get('user/'+u['id']+'/'+path);
        }
        return undefined;
    };
    self.getDetails=function(){
        var u=self.fetch('details');
        if(u){
            return u;
        }
        return $restservice.get('user/'+self.get().id,{token:self.get().token});
    };
     if (!CacheFactory.get('userCache')) {
      CacheFactory.createCache('userCache', {
        maxAge: 90 * 90 * 1000,
        deleteOnExpire: 'aggressive',
        recycleFreq: 100,
        storageMode: 'localStorage',
        onExpire:function(key,value){
            $rootScope.$broadcast("$UserExpired");
        }
      });
      self.cache = CacheFactory.get('userCache');
      var _usr=self.cache.get('/user');
      if(!_usr){
         self.cache.put('/user',{id:undefined,token:undefined,usertype:undefined});
      }
    }
    return self;
 })
.factory('sessionInjector', ['$rootScope', function($rootScope) {
    var sessionInjector = {
        request: function(config) {
            if ($rootScope.token) {
                config.headers['x-session-token'] = $rootScope.token;
            }
            return config;
        }
    };
    return sessionInjector;
}])
 .service('$orderType',function(){
        return undefined;
 })
 .service('$orderdata',function(){
        return [];
 })
 .service('$mdDialog',function(){
	 this.show=function(){};
	 this.cancel=function(){};
	 this.alert=function(message,level){
	 };
 })
 .service('$dialog',function(){

 })
 .service('$utilityservice',['$rootScope','$http','$window',function($rootScope,$http,$window){
      var self=this;
      this.parseDate=function(inputstring){
            var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
                "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
            var d = inputstring.match(new RegExp(regexp));
            var offset = 0;
            var date = new Date(d[1], 0, 1);
            if (d[3]) { date.setMonth(d[3] - 1); }
            if (d[5]) { date.setDate(d[5]); }
            if (d[7]) { date.setHours(d[7]); }
            if (d[8]) { date.setMinutes(d[8]); }
            if (d[10]) { date.setSeconds(d[10]); }
            if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
            if (d[14]) {
                offset = (Number(d[16]) * 60) + Number(d[17]);
                offset *= ((d[15] == '-') ? 1 : -1);
            }
            var time = (Number(date) + (0 * 60 * 1000));
            date.setTime(Number(time));
            return date;
      };
      this.parseTime=function(inputstring){
        var _date=this.parseDate(inputstring);
        var hours = _date.getHours();
        var minutes = _date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      };
      this.formatDate=function(inputstring){
          var _date=this.parseDate(inputstring);
          return {
              'date': (_date.getMonth() + 1) + '/' + _date.getDate() + '/' +  _date.getFullYear(),
              'time': this.parseTime(inputstring)
          };
      };
	    this.now=function(){
		      var d = new Date();
		      return d.toISOString();
	    };
      this.getScreenSize=function(){
        return {
          'width':$window.innerWidth,
          'height':$window.innerHeight
        }
      }
 }])
 .service('$restservice',['$rootScope','$http',function($rootScope,$http){
     var self=this;
     self.get = function (_endpoint,params){
         return $http({
            method:'GET',
            url:$rootScope.$domain+'/webapp/'+_endpoint,
            params:params
         });
     };
     self.post = function(_endpoint,_formObject){
         return $http({
            method:'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url:$rootScope.$domain+'/webapp/'+_endpoint,
            data:_formObject,
            transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
                str.push("entity["+encodeURIComponent(p) + "]=" + encodeURIComponent(obj[p]));
            return str.join('&');
        }
      });
     };
     self.put = function(_endpoint,_formObject){
         return $http({
            method:'PUT',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url:$rootScope.$domain+'/webapp/'+_endpoint,
            data:_formObject,
            transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
                str.push("entity["+encodeURIComponent(p) + "]=" + encodeURIComponent(obj[p]));
            return str.join('&');
        }
      });
     };
 }])
  .service('$locationservice',['$http',function($http){
    this.find=function(zipcode){
      return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+zipcode);
    };
    this.findByAddress=function(street,city,state){
      street = street.split(' ').join('+');
      return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+street+',+'+city+',+'+state);
    };
 }])
  .service('$marketservice',['$restservice',function($restservice){
    this.get=function(){
      return $restservice.get('markets');
    };
    this.getById=function(marketid){
      return $restservice.get('markets/'+marketid);
    };
    this.getMarketNames=function(){
      return $restservice.get('markets.json');
    };
    this.create=function(params){
      return $restservice.post('markets',params);
    };
    this.update=function(marketid,params){
      return $restservice.put('markets/'+marketid,params);
    };
    this.addVendor=function(params){
        return $restservice.post('markets/'+params.marketid+'/vendors/',params);
    };
    this.disable=function(marketid){
      return $restservice.put('markets/'+marketid+'/disable');
    };
    this.enable=function(marketid){
      return $restservice.put('markets/'+marketid+'/enable');
    };

  }])
 .service('$vendorservice',['$restservice',function($restservice){
    this.get=function(){
      return $restservice.get('vendors');
    };
    this.getById=function(vendorid){
      return $restservice.get('vendors/'+vendorid);
    };
    this.getByMarketId=function(marketid){
      return $restservice.get('markets/'+marketid+'/vendors/');
    };
    this.create=function(params){
      return $restservice.post('vendors',params);
    };
    this.update=function(vendorid,params){
      return $restservice.put('vendors/'+vendorid,params);
    };
    this.addProduct=function(params){
        return $restservice.post('vendors/'+params.vendorid+'/products/',params);
    };
    this.disable=function(vendorid){
      return $restservice.put('vendors/'+vendorid+'/disable');
    };
    this.enable=function(vendorid){
      return $restservice.put('vendors/'+vendorid+'/enable');
    };
    this.updateMarket=function(vendor){
      if(vendor.oldmarketid==-1){
        return $restservice.post('markets/'+vendor.marketid+'/vendors/'+vendor.VendorId+'/');
      }else{
        return $restservice.put('markets/'+vendor.marketid+'/vendors/'+vendor.VendorId+'/',{'oldmarketid':vendor.oldmarketid});
      }
    }

  }])
 .service('$customerservice',['$restservice',function($restservice){
    this.get=function(){
      return $restservice.get('customers');
    };
    this.getById=function(customerid){
      return $restservice.get('customers/'+customerid);
    };
    this.create=function(formObject){
      return $restservice.post('customers');
    };
  }])
 .service('$employeeservice',['$restservice',function($restservice){
    this.get=function(){
      return $restservice.get('employees');
    };
    this.getById=function(employeeid){
      return $restservice.get('employees/'+employeeid);
    };
    this.create=function(params){
      return $restservice.post('employees',params);
    };
    this.update=function(vendorid,params){
      return $restservice.put('employees/'+vendorid,params);
    };
  }])
  .service('$orderservice',['$restservice',function($restservice){
  this.get=function(params){
    return $restservice.get('orders/',params);
  };
  this.getById=function(id){
    return $restservice.get('orders/'+id+'/');
  };
  this.getByVendor=function(id){
    return $restservice.get('orders/vendors/'+id+'/');
  };
  this.getByCustomer=function(id){
    return $restservice.get('orders/customers/'+id+'/');
  };
  this.getByEmployee=function(id){
    return $restservice.get('orders/employees/'+id+'/');
  };
  this.update=function(params){
      return $restservice.put('orders/'+params.id+'/',params);
  };
  this.confirm=function(params){
      return $restservice.put('orders/'+params.id+'/confirm',{});
  };
  this.items={
    'get':function(order){
      return $restservice.get('orders/'+order.id);
    },
    'update':function(params){
      return $restservice.put('orders/'+params.orderid+'/');
    }
  };
  this.dashboard=function(){
    return $restservice.get('orders/dashboard/');
  };
}])
.service('$productservice',['$restservice','$rootScope','Upload',function($restservice,$rootScope,Upload){
  this.get=function(id){
    return $restservice.get('products/');
  };
  this.getById=function(id){
    return $restservice.get('products/'+id+'/');
  };
  this.getByVendor=function(id){
    return $restservice.get('products/vendors/'+id+'/');
  };
  /*
  this.create=function(params){
    return $restservice.post('vendors/'+params.vendorid+'/products/',params);
  };
  */
  this.update=function(params){
    return $restservice.put('products/'+params.id,params);
  };
  this.raise=function(event){
    $rootScope.$broadcast(event);
  };
  this.uploadImage=function(product,file){
    return Upload.upload({
      url: $rootScope.$domain+'/webapp/products/'+product.id+'/upload/', //webAPI exposed to upload the file
      data:{file:file} //pass file as data, should be user ng-model
    });
  };
  this.inventory={
    'get':function(){
      return $restservice.get('inventory/');
    },
    'getByProduct':function(id){
      return $restservice.get('products/'+id+'/inventory/');
    },
    'getByVendor':function(id){
      return $restservice.get('vendors/'+id+'/inventory/');
    },
    'create':function(params){
      return $restservice.post('products/'+params.id+'/inventory/',params);
    },
    'update':function(params){
      return $restservice.put('products/'+params.ProductId+'/inventory/'+params.id+'/',params);
    }
  };
}])
;
/* Controllers */
angular.module('store.controllers', [])
.controller('UserController',['$rootScope','$scope','$state','$mdDialog','$userservice',function($rootScope,$scope,$state,$mdDialog,$userservice,$orderdata) {
	$rootScope.viewclass="skin-blue layout-top-nav";
	$scope.user=$userservice.getDetails();
	$scope.page="login";
	$scope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
  		if(toState.name=="app.user.dashboard"){
  			$scope.page="dashboard";
  		}
  		else if(toState.name=="app.user.orders" || toState.name=="app.user.order"){
  			$scope.page="orders";
  		}
  		else if(toState.name=="app.user.vendors" || toState.name=="app.user.vendor" || toState.name=="app.user.product" || toState.name=="app.user.products"){
  			$scope.page="vendors";
  		}
      else if(toState.name=="app.user.employee" || toState.name=="app.user.employees"){
  			$scope.page="employees";
  		}
      else if(toState.name=="app.user.customers" || toState.name=="app.user.customer"){
  			$scope.page="customers";
  		}
      else if(toState.name=="app.user.markets" || toState.name=="app.user.market"){
  			$scope.page="markets";
  		}
    });
	$scope.logout=function(){
		$state.go('app.login');
	};
}])
.controller('CustomerController',['$scope','$state','$mdDialog','$customerservice','$userservice','$locationservice','$dataType', '$customerdata',function($scope,$state,$mdDialog,$customerservice,$userservice,$locationservice,$dataType,$customerdata) {
    $scope.user=$userservice.get();
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
  	'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY').split(' ').map(function (state) {
      return {abbrev: state};
    });
    $scope.showNewCustomerForm=false;
    $scope.showNewCustomer=function(){
    	$scope.newcustomer = {
    	  name: '',
    	  contactname: '',
    	  addressline1: '',
    	  addressline2: 'none',
    	  city: '',
    	  state: '',
    	  country: 'USA',
    	  zipcode: '',
    	  email: 'na@default',
    	  phone: '',
    	  latitude:0.0,
    	  longitude:0.0
    	};
    	$scope.showNewCustomerForm=true;
    };
    $scope.newcustomer = {
  		  name: '',
  		  contactname: '',
  		  addressline1: '',
  		  addressline2: 'none',
  		  city: '',
  		  state: '',
  		  country: 'USA',
  		  zipcode: '',
  		  email: 'na@default',
  		  phone: '',
  		  latitude:0.0,
  		  longitude:0.0
    };
   $scope.create=function(newcustomer){
       newcustomer.street=newcustomer.addressline1+" "+newcustomer.addressline2;
       $customerservice.create(newcustomer).success(function(data){
           if(data.rc>=0){
             $state.go('app.user.customer',{usertype: $scope.user.usertype,userid:$scope.user.id,customerid:data.CustomerId});
           }
         });
    };
    $scope.addNewCustomerFrom=function(){
  	  $scope.showNewCustomerForm=true;
    };
    $scope.cancelNewCustomer=function(){
  	  $scope.newcustomer = {
  			  name: '',
  			  contactname: '',
  			  addressline1: '',
  			  addressline2: '',
  			  city: '',
  			  state: '',
  			  country: 'USA',
  			  zipcode: '',
  			  email: 'na@default',
  			  phone: '',
  			  latitude:0.0,
  			  longitude:0.0
  	  };
  	  $scope.showNewCustomerForm=false;
    };

    function getPrimary(_customer) {
      _foundprimary = false;
      _cnt = _customer.CustomerContacts.length;
      for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
        if (_customer.CustomerContacts[_i].isprimary == 1) {
          _abcnt = _customer.CustomerContacts[_i].CustomerContactAddressBooks.length;
          for (_j = 0; _j < _abcnt && !_foundprimary; _j++) {
            if (_customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].isprimary == 1) {
              _primary = {
                customerId: _customer.id,
                name:_customer.name,
                ContactName:_customer.CustomerContacts[_i].name,
                ContactAddressBookId: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].id,
                addressline1: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline1,
                addressline2: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline2,
                city: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].city,
                country: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].country,
                email: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].email,
                phone: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].phone,
                zipcode: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].zipcode,
              };
              _foundprimary = true;
            }
          }
          if (!_foundprimary) {
            _j--;
            _primary = {
              customerId: _customer.id,
              name:_customer.name,
              ContactName:_customer.CustomerContacts[_i].name,
              ContactAddressBookId: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].id,
              addressline1: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline1,
              addressline2: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline2,
              city: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].city,
              country: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].country,
              email: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].email,
              phone: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].phone,
              zipcode: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].zipcode
            };
            _foundprimary = true;
          }
        }
      }
      if (!_foundprimary) {
        _j = 0;
        for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
          _abcnt = _customer.CustomerContacts[_i].CustomerContactAddressBooks.length;
          if (_abcnt > 0) {
            _j = 0;
            _primary = {
              customerId: _customer.id,
              name:_customer.name,
              ContactName:_customer.CustomerContacts[_i].name,
              ContactAddressBookId: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].id,
              addressline1: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline1,
              addressline2: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].addressline2,
              city: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].city,
              country: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].country,
              email: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].email,
              phone: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].phone,
              zipcode: _customer.CustomerContacts[_i].CustomerContactAddressBooks[_j].zipcode
            };
            _foundprimary = true;
          }
        }
      }
      return _primary;
    }
    if($dataType=='customers'){
      $scope.by_customer="";
      $scope.customers=[];
      _count=$customerdata.data.data.length;
      for(_c=0;_c<_count;_c++){
        _data=$customerdata.data.data[_c];
        _cnt=_data.length;
        _i=0; _j=0;
        _primary = {
          id: _data.id,
          name: _data.name,
          address:'n/a',
          city: 'n/a',
          phone: 'n/a',
          zipcode: 'n/a',
        };
        if(_data.CustomerContacts && _data.CustomerContacts.length>0){
            _abcnt = _data.CustomerContacts[_i].CustomerContactAddressBooks.length;
            if (_abcnt > 0) {
                _primary.address=_data.CustomerContacts[_i].CustomerContactAddressBooks[_j].formattedaddress;
                _primary.city=_data.CustomerContacts[_i].CustomerContactAddressBooks[_j].city;
                _primary.phone=_data.CustomerContacts[_i].CustomerContactAddressBooks[_j].phone;
                _primary.zipcode=_data.CustomerContacts[_i].CustomerContactAddressBooks[_j].zipcode;
            }
        }
        $scope.customers.push(_primary);
      }
    }
    if($dataType=='customer') {
      _data = $customerdata.data.data;
      _primary = getPrimary(_data);
      $scope.customer = {
        id: _data.id,
        name: _data.name,
        createdAt: _data.createdAt,
        updatedAt: _data.updatedAt,
      };
      $scope.customer.primary = angular.copy(_primary);
      $scope.backup = angular.copy(_primary);
      $scope.cancelUpdateCustomer=function(){
        $scope.backup=angular.copy($scope.customer.primary);
      };
      $scope.updateCustomer=function(){
        $customerservice.update($scope.customer.id,$scope.backup).success(function(data){
            if(data.rc>=0){
              $scope.vendor.primary = angular.copy($scope.backup);
            }
          });
      };
    }
}])
.controller('EmployeeController',['$scope','$state','$mdDialog','$employeeservice','$userservice','$locationservice','$dataType', '$employeedata',function($scope,$state,$mdDialog,$employeeservice,$userservice,$locationservice,$dataType,$employeedata) {
  $scope.user=$userservice.get();
  $scope.showNewEmployeeForm=false;
  $scope.by_employee="";
  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
	'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY').split(' ').map(function (state) {
    return {abbrev: state};
  });
  $scope.showNewEmployee=function(){
  	$scope.newemployee = {
  	  name: '',
  	  gender: '',
  	  addressline1: '',
  	  addressline2: '',
  	  city: '',
  	  state: '',
  	  country: 'USA',
  	  zipcode: '',
  	  email: 'na@default',
  	  phone: '',
  	  latitude:0.0,
  	  longitude:0.0
  	};
  	$scope.showNewEmployeeForm=true;
  };
  $scope.newemployee = {
		  name: '',
		  gender: '',
		  addressline1: '',
		  addressline2: '',
		  city: '',
		  state: '',
		  country: 'USA',
		  zipcode: '',
		  email: 'na@default',
		  phone: '',
		  latitude:0.0,
		  longitude:0.0
  };
 $scope.create=function(newemployee){
     console.log(newemployee);
     newemployee.street=newemployee.addressline1+" "+newemployee.addressline2;
     $employeeservice.create(newemployee).success(function(data){
         if(data.rc>=0){
           $state.go('app.user.employee',{usertype: $scope.user.usertype,userid:$scope.user.id,employeeid:data.EmployeeId});
         }
       });
  };
  $scope.addNewEmployeeFrom=function(){
	  $scope.showNewEmployeeForm=true;
  };
  $scope.cancelNewEmployee=function(){
	  $scope.newemployee = {
			  name: '',
			  gender: '',
			  addressline1: '',
			  addressline2: '',
			  city: '',
			  state: '',
			  country: 'USA',
			  zipcode: '',
			  email: 'na@default',
			  phone: '',
			  latitude:0.0,
			  longitude:0.0
	  };
	  $scope.showNewEmployeeForm=false;
  };

  // $scope.addNewEmployeeFrom=function(){
  //   $scope.showNewEmployeeForm=true;
  // };
  // $scope.showNewEmployeeDialog=function(event) {
  //   $mdDialog.show({
  //     targetEvent: event,
  //     scope: $scope,
  //     preserveScope: true,
  //     clickOutsideToClose:true,
  //     templateUrl: '/www/views/'+$scope.user['usertype']+'/employee.new.html',
  //     controller: function ($scope, $mdDialog) {
  //       $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
  //       'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
  //       'WY').split(' ').map(function (state) {
  //         return {abbrev: state};
  //       });
  //       $scope.genders = ('Male,Female').split(',').map(function (gender) {
  //         return {abbrev: gender};
  //       });
  //       $scope.entity = {
  //         name: '',
  //         contactname: '',
  //         addressline1: '',
  //         addressline2: '',
  //         city: '',
  //         state: '',
  //         country: 'USA',
  //         zipcode: '',
  //         email: '',
  //         phone: '',
  //         latitude:0.0,
  //         longitude:0.0,
  //         password:'',
  //         password2:''
  //       };
  //     }
  //   });
  // };
  // $scope.save=function(){
  //   $locationservice
  //       .find($scope.entity.addressline1+' '+$scope.entity.addressline2,$scope.entity.city,$scope.entity.state)
  //       .then(function(location){
  //             $scope.entity.formattedaddress=location.data.results[0].formatted_address;
  //             var ll=location.data.results[0].address_components.length-1;
  //             $scope.entity.zipcode=location.data.results[0].address_components[ll].long_name;
  //             $scope.entity.latitude=location.data.results[0].geometry.location.lat;
  //             $scope.entity.longitude=location.data.results[0].geometry.location.lng;
  //           $employeeservice.createEmployee($scope.entity).success(function(data){
  //             if(data.rc>=0){
  //               $mdDialog.cancel();
  //               $state.go('app.user.employee',{employeeid:data.id});
  //             }
  //           });
  //       });
  // };
  // $scope.cancel=function(){
  //   $mdDialog.cancel();
  //   if($scope.detailineditmode){
  //     $scope.detailineditmode=false;
  //     $scope.selectedEmployee={};
  //   }
  // };
  // $scope.selectedEmployee={};
  // $scope.detailineditmode=false;
  // $scope.edit=function(employee){
  //   $scope.detailineditmode=true;
  //   $scope.selectedEmployee=angular.copy(employee);
  // };
  function getPrimary(_employee) {
    _foundprimary = false;
    _cnt = _employee.EmployeeAddressBooks.length;
    _i=0;
    _primary = {
      EmployeeId: _employee.id,
      name:_employee.name,
      EmployeeAddressBookId: _employee.EmployeeAddressBooks[_i].id,
      addressline1: _employee.EmployeeAddressBooks[_i].addressline1,
      addressline2: _employee.EmployeeAddressBooks[_i].addressline2,
      city: _employee.EmployeeAddressBooks[_i].city,
      state: _employee.EmployeeAddressBooks[_i].state,
      country: _employee.EmployeeAddressBooks[_i].country,
      email: _employee.EmployeeAddressBooks[_i].email,
      phone: _employee.EmployeeAddressBooks[_i].phone,
      zipcode: _employee.EmployeeAddressBooks[_i].zipcode,
    };
    return _primary;
  };
  if($dataType=='employees'){
    var _employees=[];
    var _ec=$employeedata.data.data.length;
    for(var _e=0; _e<_ec;_e++){
        _employee=$employeedata.data.data[_e];
        _cnt = _employee.EmployeeAddressBooks.length;
        _i=0;
        _primary = {
          id: _employee.id,
          name:_employee.name,
          EmployeeAddressBookId: _employee.EmployeeAddressBooks[_i].id,
          address:_employee.EmployeeAddressBooks[_i].formattedaddress,
          city: _employee.EmployeeAddressBooks[_i].city,
          phone: _employee.EmployeeAddressBooks[_i].phone
        };
        _employees.push(_primary);
    }
    $scope.employees=_employees;
  }
  if($dataType=='employee') {
    _data = $employeedata.data.data;
    _primary = getPrimary(_data);
    $scope.employee = {
      id: _data.id,
      name: _data.name,
      createdAt: _data.createdAt,
      updatedAt: _data.updatedAt,
    };
    $scope.employee.primary = angular.copy(_primary);
    $scope.backup = angular.copy(_primary);
    $scope.cancelUpdateEmployee=function(){
      $scope.backup=angular.copy($scope.employee.primary);
    };
    $scope.updateEmployee=function(){
      $employeeservice.update($scope.employee.id,$scope.backup).success(function(data){
          if(data.rc>=0){
            $scope.employee.primary = angular.copy($scope.backup);
          }
        });
    }

  }
}])
.controller('InventoryController',['$scope','$state','$mdDialog','$productservice','$products',function($scope,$state,$mdDialog,$productservice,$products){
  $scope.isvendor=false;
  function getProducts(products){
    _product=[];
    _datalength=products.data.length;
    for(n=0;n<_datalength;n++){
      _data=products.data[n];
      if(_data.Inventories.length<=0){
        _product.push({
          id:_data.id,
          name:_data.name,
          inventoryId:false,
            vendor:{
                id:_data.Vendors[0].id,
                name:_data.Vendors[0].name
            }
        });
      }else{
        for(iv=0;iv<_data.Inventories.length;iv++){
          _product.push({
            id:_data.id,
            name:_data.name,
            inventoryId:_data.Inventories[iv].id,
            serialnumber:_data.Inventories[iv].serialnumber,
            unitprice:_data.Inventories[iv].unitprice,
            instock:_data.Inventories[iv].instock,
            restock:_data.Inventories[iv].restock,
            vendor:{
                id:_data.Vendors[0].id,
                name:_data.Vendors[0].name
            }
          });
        }
      }
    }
    return _product;
  }
  $scope.$watch("$scope.currentVendor",function(){
    $scope.initByVendor($scope.currentVendor);
  });
  $scope.initByVendor=function(vendor){
    if(vendor!=undefined){
      $scope.isvendor=true;
      $productservice.inventory.getByVendor(vendor.id).success(function(data){
        $scope.products=getProducts(data);
      });
    }
  };
  $scope.products=getProducts($products.data);
  $scope.selected = {};
  $scope.query = {
    order: 'id',
    limit: 5,
    page: 1
  };
  $scope.$on('onProductUpdated',function(){
    $productservice.getProducts().success(function(data){
      $scope.products=data;
    });
  });
  $scope.getTemplate=function(product){
    if(product.id==$scope.selected.id){
      return 'edit_product_row';
    }else{
      return 'display_product_row';
    }
  };
  $scope.edit=function(product){
    $scope.selected = angular.copy(product);
  };
  $scope.cancel=function(){
    $scope.selected = {};
  };
  $scope.update=function(product){
    $productservice.inventory.update(product).success(function(data){
      if(data.rc>=0){
        angular.forEach($scope.products,function(product,key){
          if(product.id==$scope.selected.id){
            $scope.products[key]=angular.copy($scope.selected);
          }
        });
        $scope.cancel();
      }
    });
  };
  $scope.addInventory=function(product){
    $productservice.inventory.create(product).success(function(data){
      if(data.rc>=0){
        angular.forEach($scope.products,function(product,key){
          if(product.id==$scope.selected.id){
            $scope.products[key]=angular.copy($scope.selected);
          }
        });
        $scope.cancel();
      }
    });
  };
  $scope.showNewForm=function(event){
    $mdDialog.show({
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose:true,
      templateUrl: '/www/views/'+$scope.user['usertype']+'/newproduct.html',
      controller: function($scope,$mdDialog) {
          $scope.entity={
            name:'test product',
            type:'test type',
            model:'test model',
            category:'test category',
            subcategory:'test sub category',
            serialnumber:'0000000000',
            vendorid:$scope.currentVendor.id,
            vendorname:$scope.currentVendor.name
          };
          $scope.save=function(){
            $productservice.create($scope.entity).success(function(data){
              if(data.rc>=0){
                $mdDialog.cancel();
              }
            });
          };
          $scope.cancel=function(){
            $mdDialog.cancel();
          };
        }
    });
  };
}])
.controller('OrderController',['$scope','$state','$mdDialog','$orderservice','$userservice','$utilityservice','$orderType', '$orderdata',function($scope,$state,$mdDialog,$orderservice,$userservice,$utilityservice,$orderType,$orderdata) {
  $scope.user=$userservice.get();
  $scope.date = new Date();
  $scope.by_order ="";
  $scope.offset=30;
  $scope.save=function(){
  };
  $scope.cancel=function(){
  };
  $scope.go=function(order){
      $state.go('app.user.order',{usertype:($scope.user.usertype),userid:$scope.user.id,orderid:order.id});
  };
  $scope.selectedorder=undefined;
  $scope.confirm=function(order){
      $scope.selectedorder=order;
      $orderservice.confirm(order).then(function(response){
          if(response.data.rc==0){
              $scope.selectedorder.status=response.data.data;
              $scope.selectedorder.isstatusupdate=false;
          }
      }).catch(function(error){
         console.log(error);
      });
  };
  if($orderType=='orders'){
    $scope.orders=[];
    $scope.updateOrderOffset=function(){

    };
    _count=$orderdata.data.data.length;
    for(_c=0;_c<_count;_c++){
      _data=$orderdata.data.data[_c];
      _cnt=_data.length;
      _i=0; _j=0;
        _da=$utilityservice.formatDate(_data.deliveryAt);
        _sa=$utilityservice.formatDate(_data.scheduleAt);
        _primary = {
          id: _data.id,
          name: _data.name,
          createdAt: _data.createdAt,
          scheduleAt:_sa.date+' '+_sa.time,
          updatedAt:_data.updatedAt,
          pickupAt:[],
          deliveryAt:{
            'formattedaddress':'Not Assigned',
            'phone':'Not Assigned',
            'city':'Not Assigned',
            },
          deliveryDate:_da.date+' '+_da.time,
          status:_data.status,
          isstatusupdate:false,
          employee:{name:'Not Assigned',id:0}
        };
        if(_data.CustomerContactAddressBook){
            _primary.deliveryAddress={
                'formattedaddress':_data.CustomerContactAddressBook.formattedaddress,
                'phone':_data.CustomerContactAddressBook.phone,
                'city':_data.CustomerContactAddressBook.city,
            };
        };
      _abcnt=0;
      if(_data.OrderVendors && _data.OrderVendors.length>=0){
          _abcnt = _data.OrderVendors.length;
      }
      if (_abcnt > 0 && $scope.user.usertype=="vendor") {
          for(_i=0;_i<_abcnt;_i++){
              if(_data.OrderVendors[_i].status=="new"){
                _primary.isstatusupdate=true;
              }
           _primary.status=_data.OrderVendors[_i].status;
          }
      }else{
              _primary.pickupAt.push({
                  'VendorId': '0',
                  'city':'n/a',
                  'phone':'n/a'
              });
      }
      if(_data.Employee != undefined){
          _primary.employee.name = _data.Employee.name;
          _primary.employee.id = _data.EmployeeId;
      }
      $scope.orders.push(_primary);
    }
  }
  else if($orderType=='order') {
    _data = $orderdata.data.data;
    if(_data !=null || _data !=undefined){
      $scope.order = _data;
      $scope.orderisvalid = true;
      $scope.order.scheduleAt=$utilityservice.formatDate(_data.scheduleAt);
      $scope.order.deliveryAt=$utilityservice.formatDate(_data.deliveryAt);
    }else{
      $scope.orderisvalid = false;
    }
  }
  else if($orderType=='vendor'){
    $scope.orders=[];
    _count=$orderdata.data.data.length;
    for(_c=0;_c<_count;_c++){
      _data=$orderdata.data.data[_c];
      _cnt=_data.length;
      _i=0; _j=0;
      _primary = {
        id: _data.id,
        createdAt: _data.createdAt,
        scheduleAt:_data.scheduleAt,
        updatedAt:_data.updatedAt,
        pickupAt:[],
        deliveryAt:{
          'formattedaddress':_data.CustomerContactAddressBook.formattedaddress,
          'phone':_data.CustomerContactAddressBook.phone,
          'city':_data.CustomerContactAddressBook.city,
          },
        status:_data.status
      };
      _abcnt = _data.OrderVendors[_i].length;
      if (_abcnt > 0) {
          for(_i=0;_i<_abcnt;_i++){
              _primary.pickupAt.push({
                  'VendorId': _data.OrderVendors[_i].VendorId,
                  'city':_data.OrderVendors[_i].VendorContactAddressBook.city,
                  'phone':_data.OrderVendors[_i].VendorContactAddressBook.phone
              });
          }
      }else{
              _primary.pickupAt.push({
                  'VendorId': '0',
                  'city':'n/a',
                  'phone':'n/a'
              });
      }
      $scope.orders.push(_primary);
    }
  }
    $scope.showOrderByCustomers=function(id){
        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: '/www/views/modals/orders.dialog.html',
          clickOutsideToClose:true,
          controller:function($scope,$utilityservice){
              $scope.orders=[];
              $scope.customerId=id;
              $scope.init=function(){
                  $orderservice.getByCustomer($scope.customerId).then(function(response){
                    _data=response.data.data;
                    _dc=_data.length;
                    for(_d=0;_d<_dc;_d++){
                        _da=$utilityservice.formatDate(_data[_d].deliveryAt);
                        _sa=$utilityservice.formatDate(_data[_d].scheduleAt);
                        $scope.orders.push({
                            id:_data[_d].id,
                            scheduleAt:_sa,
                            deliveryDate:_da,
                            employee:_data[_d].Employee
                        });
                    }
                  }).catch(function(err){
                  });
              };
          }
        });
        return false;
    };
    $scope.showOrderByVendors=function(id){
        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: '/www/views/modals/orders.dialog.html',
          clickOutsideToClose:true,
          controller:function($scope,$utilityservice){
              $scope.orders=[];
              $scope.vendorid=id;
              $scope.init=function(){
                  $orderservice.getByVendor($scope.vendorid).then(function(response){
                    _data=response.data.data;
                    _dc=_data.length;
                    for(_d=0;_d<_dc;_d++){
                        _da=$utilityservice.formatDate(_data[_d].deliveryAt);
                        _sa=$utilityservice.formatDate(_data[_d].scheduleAt);
                        $scope.orders.push({
                            id:_data[_d].id,
                            scheduleAt:_sa,
                            deliveryDate:_da,
                            employee:_data[_d].Employee
                        });
                    }
                  }).catch(function(err){
                  });
              };
          }
        });
        return false;
    };
    $scope.showOrderByEmployees=function(id){
        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: '/www/views/modals/orders.dialog.html',
          clickOutsideToClose:true,
          controller:function($scope,$utilityservice){
              $scope.orders=[];
              $scope.employeeId=id;
              $scope.init=function(){
                  $orderservice.getByEmployee($scope.employeeId).then(function(response){
                    _data=response.data.data;
                    _dc=_data.length;
                    for(_d=0;_d<_dc;_d++){
                        _da=$utilityservice.formatDate(_data[_d].deliveryAt);
                        _sa=$utilityservice.formatDate(_data[_d].scheduleAt);
                        $scope.orders.push({
                            id:_data[_d].id,
                            scheduleAt:_sa,
                            deliveryDate:_da,
                            employee:_data[_d].Employee
                        });
                    }
                  }).catch(function(err){
                  });
              };
          }
        });
        return false;
    };
}])
.controller('VendorProductController',['$scope','$state','$mdDialog','$productservice',function($scope,$state,$mdDialog,$productservice){
  $scope.showNewForm=function(event){
    $mdDialog.show({
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose:true,
      templateUrl: '/www/views/'+$scope.user['usertype']+'/newproduct.html',
      controller: function($scope,$mdDialog) {
          $scope.entity={
            name:'test product',
            type:'test type',
            model:'lb',
            category:'test category',
            subcategory:'test sub category',
            serialnumber:'0000000000',
            vendorid:$scope.currentVendor.id,
            vendorname:$scope.currentVendor.name
          };
          $scope.save=function(){
            $productservice.create($scope.entity).success(function(response){
              if(response.rc>=0){
                  console.log(response);
                $scope.products.push(response.data);
                  console.log($scope.products);
                $mdDialog.cancel();
              }
            });
          };
          $scope.cancel=function(){
            $mdDialog.cancel();
          };
        }
    });
  };
}])
.controller('ProductController',['$scope','$state','$mdDialog','$userservice','$productservice','$productType','$productdata',function($scope,$state,$mdDialog,$userservice,$productservice,$productType,$productdata){
  $scope.user=$userservice.get();
  $scope.detailineditmode=false;
  $scope.selectedProduct = {};
  $scope.isImageEditMode=false;
  $scope.isImageUpdated=false;
  var _inventories=[];
  var _data=$productdata.data.data;
  var _datalength=$productdata.data.data.length;
  var _product=_data;
  if($productType=="product"){
    for(var key in _data){
      if(!Array.isArray(_data[key])){
        _product[key]=_data[key];
      }
    }
  }
  if(_data.Inventories){
    for(var iv=0;iv<_data.Inventories.length;iv++){
      var _upd=_data.Inventories[iv].updatedAt.slice(0,10);
      _data.Inventories[iv].updatedAt=_upd;
      _data.Inventories[iv].ProductId=_product.id;
      _data.Inventories[iv].readonly=true;
      _inventories.push(_data.Inventories[iv]);
    }
  }
  if(_data['ProductImages']==undefined || _data['ProductImages'].length<=0){
    _product['image']='/www/assets/images/noimage.png';
  }else{
    _product['image']='/tmp/uploads/'+_data['ProductImages'][0]['filename'];
  }
  var _vendor={id:0,name:'unknown'};
  if(_data.Vendors && _data.Vendors.length>0){
      _vendor={
          id:_data.Vendors[0].id,
          name:_data.Vendors[0].name
     };
  }
  $scope.vendor=_vendor;
  $scope.products=_product;
  $scope.$on('$VendorAddedProduct',function(event,product){
	  product.newproduct['image']='/www/assets/images/noimage.png';
	  $scope.products.push(product.newproduct);
  });
  if($productType=="product"){
      $scope.product=_product;
      $scope.product.category="food";
      $scope.newinventory={
  	        id:$scope.product.id,
  	        ProductId:$scope.product.id,
  	        instock:0,
  	        restock:0,
  	        unitprice:0.00,
  	        serialnumber:'',
  	      };
  }
  $scope.inventories=_inventories;
  /*
  $scope.edit=function(product){
    $scope.detailineditmode=true;
    $scope.selectedProduct = angular.copy(product);
  }
  $scope.cancel=function(){
    $scope.detailineditmode=false;
    $scope.selectedProduct = {};
  }
  */
  $scope.save=function(product){
    $productservice.update(product).success(function(data){
      if(data.rc>=0){
    	  //console.log(data);
      }
    });
  };
  /*
  $scope.update=function(product){
    $productservice.inventory.create(inventory).success(function(data){
      if(data.rc>=0){
        angular.forEach($scope.inventories,function(inventory,key){
          if(inventory.id==$scope.selectedInventory.id){
            $scope.inventories[key]=angular.copy($scope.selectedInventory);
          }
        });
        $scope.detailineditmode=false;
      }
    });
  }
  */
  /**** Inventory Control ****/
  $scope.showNewInventoryForm=false;
  $scope.newInventory=function(){
	  $scope.showNewInventoryForm=true;
	  $scope.newinventory={
		        id:$scope.product.id,
		        ProductId:$scope.product.id,
		        instock:0,
		        restock:0,
		        unitprice:0.00,
		        serialnumber:'',
		      };
  };
  $scope.cancelNewInventory=function(){
	  $scope.showNewInventoryForm=false;
	  $scope.newinventory={
		        id:$scope.product.id,
		        ProductId:$scope.product.id,
		        instock:0,
		        restock:0,
		        unitprice:0.00,
		        serialnumber:'',
		      };
  };
  $scope.addInventory=function(newinventory){
	  $scope.showNewInventoryForm=false;
      $productservice.inventory.create(newinventory).success(function(data){
        if(data.rc>=0){
          _data=data.data;
          _cr=_data.createdAt.slice(0,10);
          _upd=_data.updatedAt.slice(0,10);
          _data.createdAt=_cr;
          _data.updatedAt=_upd;
          _data.readonly=true;
          $scope.inventories.push(_data);
        }
      });
  };
  $scope.editInventory=function(inventory,index){
	inventory.previous = {
	        ProductId:inventory.ProductId,
	        instock:inventory.instock,
	        restock:inventory.restock,
	        unitprice:inventory.unitprice,
	        serialnumber:inventory.serialnumber
	};
    inventory.readonly=false;
  };
  $scope.cancelEditInventory=function(inventory){
	  inventory.instock=inventory.previous.instock;
	  inventory.restock=inventory.previous.restock;
	  inventory.unitprice=inventory.previous.unitprice;
	  inventory.serialnumber=inventory.previous.serialnumber;
	  inventory.readonly=true;
  };
  $scope.updateInventory=function(inventory){
	  inventory.readonly=true;
    $productservice.inventory.update(inventory).success(function(data){
      if(data.rc>=0){
    	  /*
        angular.forEach($scope.inventories,function(inventory,key){
          if(inventory.id==$scope.selectedInventory.id){
            $scope.inventories[key]=angular.copy($scope.selectedInventory);
            $scope.cancelEditInventory();
          }
        });
		*/
      }
    });
  };
  $scope.editImage=function(){
    $scope.isImageEditMode=true;
    $scope.isImageUpdated=true;
  };
  $scope.onFileSelected=function(){
    $scope.isImageUpdated=true;
  };
  $scope.cancelImage=function(){
    $scope.isImageEditMode=false;
    $scope.isImageUpdated=false;
  };
  $scope.saveImage=function(){
    $productservice.uploadImage($scope.product,$scope.file).then(function (resp) { //upload function returns a promise
      if(resp.data.rc === 0){ //validate success
        $scope.product.image=resp.data.location;
        $scope.cancelImage();
      } else {
        console.log("error");
      }
    }, function (resp) { //catch error
      //console.log('Error status: ' + resp.status);
    }, function (evt) {
      //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };
}])
.controller('VendorController',['$scope','$state','$mdDialog','$vendorservice','$userservice','$locationservice','$dataType', '$vendordata','$marketdata',function($scope,$state,$mdDialog,$vendorservice,$userservice,$locationservice,$dataType,$vendordata,$marketdata) {
  $scope.user=$userservice.get();
  $scope.fiterbydisabled=-1;
  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
	'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY').split(' ').map(function (state) {
    return {abbrev: state};
  });
  $scope.markets=$marketdata.data.data;
  $scope.showNewVendorForm=false;
  $scope.showNewVendor=function(){
  	$scope.newvendor = {
  	  name: '',
      marketid:-1,
      marketname:'undefined',
  	  contactname: '',
  	  addressline1: '',
  	  addressline2: 'none',
  	  city: '',
  	  state: '',
  	  country: 'USA',
  	  zipcode: '',
  	  email: 'na@default',
  	  phone: '',
  	  latitude:0.0,
  	  longitude:0.0
  	};
  	$scope.showNewVendorForm=true;
  };
  $scope.newvendor = {
		  name: '',
      marketid:-1,
      marketname:'undefined',
		  contactname: '',
		  addressline1: '',
		  addressline2: 'none',
		  city: '',
		  state: '',
		  country: 'USA',
		  zipcode: '',
		  email: 'na@default',
		  phone: '',
		  latitude:0.0,
		  longitude:0.0
  };
 $scope.create=function(newvendor){
     newvendor.street=newvendor.addressline1+" "+newvendor.addressline2;
     $vendorservice.create(newvendor).success(function(data){
         if(data.rc>=0){
           $state.go('app.user.vendor',{usertype: $scope.user.usertype,userid:$scope.user.id,vendorid:data.VendorId});
         }
       });
  };
  $scope.addNewVendorFrom=function(){
	  $scope.showNewVendorForm=true;
  };
  $scope.cancelNewVendor=function(){
	  $scope.newvendor = {
			  name: '',
        marketid:-1,
        marketname:'undefined',
			  contactname: '',
			  addressline1: '',
			  addressline2: '',
			  city: '',
			  state: '',
			  country: 'USA',
			  zipcode: '',
			  email: 'na@default',
			  phone: '',
			  latitude:0.0,
			  longitude:0.0
	  };
	  $scope.showNewVendorForm=false;
  };
  function getPrimary(_vendor) {
    var _foundprimary = false;
    var _cnt = _vendor.VendorContacts.length;
    for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
      if (_vendor.VendorContacts[_i].isprimary == 1) {
        _abcnt = _vendor.VendorContacts[_i].VendorContactAddressBooks.length;
        for (_j = 0; _j < _abcnt && !_foundprimary; _j++) {
          if (_vendor.VendorContacts[_i].VendorContactAddressBooks[_j].isprimary == 1) {
            _primary = {
              VendorId: _vendor.id,
              marketid:-1,
              marketname:'undefined',
              name:_vendor.name,
              isdeleted:_vendor.isdeleted,
              ContactId:_vendor.VendorContacts[_i].id,
              ContactName:_vendor.VendorContacts[_i].name,
              ContactAddressBookId: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].id,
              addressline1: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline1,
              addressline2: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline2,
              state:'CA',
              city: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].city,
              country: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].country,
              email: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].email,
              phone: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].phone,
              zipcode: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].zipcode,
            };
            _foundprimary = true;
          }
        }
        if (!_foundprimary) {
          _j--;
          _primary = {
            VendorId: _vendor.id,
            marketid:-1,
            marketname:'undefined',
            name:_vendor.name,
            isdeleted:_vendor.isdeleted,
            ContactId:_vendor.VendorContacts[_i].id,
            ContactName:_vendor.VendorContacts[_i].name,
            ContactAddressBookId: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].id,
            addressline1: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline1,
            addressline2: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline2,
            city: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].city,
            state:'CA',
            country: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].country,
            email: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].email,
            phone: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].phone,
            zipcode: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].zipcode,
          };
          _foundprimary = true;
        }
      }
    }
    if (!_foundprimary) {
      _j = 0;
      for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
        _abcnt = _data.VendorContacts[_i].VendorContactAddressBooks.length;
        if (_abcnt > 0) {
          _j = 0;
          _primary = {
            VendorId: _vendor.id,
            oldmarketid:-1,
            marketid:-1,
            marketname:'undefined',
            name:_vendor.name,
            isdeleted:_vendor.isdeleted,
            ContactId:_vendor.VendorContacts[_i].id,
            ContactName:_vendor.VendorContacts[_i].name,
            ContactAddressBookId: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].id,
            addressline1: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline1,
            addressline2: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].addressline2,
            city: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].city,
            state:'CA',
            country: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].country,
            email: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].email,
            phone: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].phone,
            zipcode: _vendor.VendorContacts[_i].VendorContactAddressBooks[_j].zipcode,
          };
          _foundprimary = true;
        }
      }
    }

    var _cnt = _vendor.Markets.length;
    if(_cnt>0){
      _primary.oldmarketid=_vendor.Markets[0].id;
      _primary.marketid=_vendor.Markets[0].id;
      _primary.marketname=_vendor.Markets[0].name;
    }

    return _primary;
  };
  if($dataType=='vendors'){
      $scope.by_vendor="";
      $scope.vendors=[];
    _count=$vendordata.data.data.length;
    for(_c=0;_c<_count;_c++){
      _data=$vendordata.data.data[_c];
      _cnt=_data.length;
      _i=0; _j=0;
      _abcnt = _data.VendorContacts[_i].VendorContactAddressBooks.length;
      if (_abcnt > 0) {
          _primary = {
            id: _data.id,
            marketid:-1,
            marketname:'undefined',
            name: _data.name,
            isdeleted: _data.isdeleted,
            ContactId:_data.VendorContacts[_i].id,
            ContactAddressBookId: _data.VendorContacts[_i].VendorContactAddressBooks[_j].id,
            ContactName: _data.VendorContacts[_i].name,
            address: _data.VendorContacts[_i].VendorContactAddressBooks[_j].formattedaddress,
            state:'CA',
            city: _data.VendorContacts[_i].VendorContactAddressBooks[_j].city,
            phone: _data.VendorContacts[_i].VendorContactAddressBooks[_j].phone,
            zipcode: _data.VendorContacts[_i].VendorContactAddressBooks[_j].zipcode,
          };
      }else{
          _primary = {
            id: _data.id,
            marketid:-1,
            marketname:'undefined',
            name: _data.name,
            isdeleted: _data.isdeleted,
            ContactName:'n/a',
            ContactId:0,
            ContactAddressBookId:0,
            state:'CA',
            address:'n/a',
            city: 'n/a',
            phone: 'n/a',
            zipcode: 'n/a',
          };
      }
      $scope.vendors.push(_primary);
    }
  }
  if($dataType=='vendor') {
    _data = $vendordata.data.data;
    _primary = getPrimary(_data);
    $scope.vendor = {
      id: _data.id,
      oldmarketid:-1,
      marketid:-1,
      marketname:'undefined',
      name: _data.name,
      isdeleted:_data.isdeleted,
      createdAt: _data.createdAt,
      updatedAt: _data.updatedAt,
    };
    $scope.vendor.primary = angular.copy(_primary);
    $scope.backup = angular.copy(_primary);

    $scope.DisableVendor=function(){
      $vendorservice.disable($scope.vendor.id).success(function(data){
          if(data.rc>=0){
            $scope.vendor.primary.isdeleted=1;
            $scope.backup.isdeleted=1;
          }
      });
    };

    $scope.EnableVendor=function(){
      $vendorservice.enable($scope.vendor.id).success(function(data){
          if(data.rc>=0){
            $scope.vendor.primary.isdeleted=0;
            $scope.backup.isdeleted=0;
          }
      });
    };

    $scope.cancelUpdateVendor=function(){
      $scope.backup=angular.copy($scope.vendor.primary);
    };

    $scope.updateVendor=function(){
      $vendorservice.update($scope.vendor.id,$scope.backup).success(function(data){
          if(data.rc>=0){
            $scope.vendor.primary = angular.copy($scope.backup);
          }
        });
    };
    $scope.newproduct={
            name:'',
            type:'',
            model:'',
            category:'food',
            subcategory:'',
            serialnumber:'0000000000',
            vendorid:$scope.vendor.id,
            vendorname:$scope.vendor.primary.name
    };
    $scope.showNewProductForm=false;
    $scope.addNewProductForm=function(){
        $scope.newproduct={
                name:'',
                type:'',
                model:'',
                category:'food',
                subcategory:'',
                serialnumber:'0000000000',
                vendorid:$scope.vendor.id,
                vendorname:$scope.vendor.primary.name
        };
        $scope.showNewProductForm=true;
    };
    $scope.cancelNewProductForm=function(){
        $scope.newproduct={
                name:'',
                type:'',
                model:'',
                category:'food',
                subcategory:'',
                serialnumber:'0000000000',
                vendorid:$scope.vendor.id,
                vendorname:$scope.vendor.primary.name
        };
        $scope.showNewProductForm=false;
    };
    $scope.addProduct=function(newproduct){
        $vendorservice.addProduct(newproduct).success(function(response){
            if(response.rc>=0){
            	$scope.showNewProductForm=false;
                $scope.$broadcast('$VendorAddedProduct',{'newproduct':response.data});
            }
          });
    };

    $scope.updateVendorMarket=function(){
        $scope.backup.marketname=$scope.backup.marketid.name;
        $scope.backup.marketid=$scope.backup.marketid.id;
        $vendorservice.updateMarket($scope.backup).success(function(response){
            if(response.rc>=0){
              $scope.vendor.primary = angular.copy($scope.backup);
            }
          });
    }

  }
}])
.controller('MarketController',['$scope','$state','$mdDialog','$marketservice','$userservice','$locationservice','$dataType', '$marketdata','$vendorservice',function($scope,$state,$mdDialog,$marketservice,$userservice,$locationservice,$dataType,$marketdata,$vendorservice) {
  $scope.user=$userservice.get();
  $scope.fiterbydisabled=-1;
  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
	'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY').split(' ').map(function (state) {
    return {abbrev: state};
  });
  $scope.showNewMarketForm=false;
  $scope.showNewMarket=function(){
  	$scope.newmarket = {
  	  name: '',
  	  contactname: '',
  	  addressline1: '',
  	  addressline2: 'none',
  	  city: '',
  	  state: '',
  	  country: 'USA',
  	  zipcode: '',
  	  email: 'na@default',
  	  phone: '',
  	  latitude:0.0,
  	  longitude:0.0
  	};
  	$scope.showNewMarketForm=true;
  };
  $scope.newmarket = {
		  name: '',
		  contactname: '',
		  addressline1: '',
		  addressline2: 'none',
		  city: '',
		  state: '',
		  country: 'USA',
		  zipcode: '',
		  email: 'na@default',
		  phone: '',
		  latitude:0.0,
		  longitude:0.0
  };
 $scope.create=function(newmarket){
     newmarket.street=newmarket.addressline1+" "+newmarket.addressline2;
     $marketservice.create(newmarket).success(function(data){
         if(data.rc>=0){
           $state.go('app.user.market',{usertype: $scope.user.usertype,userid:$scope.user.id,marketid:data.MarketId});
         }
       });
  };
  $scope.addNewMarketFrom=function(){
	  $scope.showNewMarketForm=true;
  };
  $scope.cancelNewMarket=function(){
	  $scope.newmarket = {
			  name: '',
			  contactname: '',
			  addressline1: '',
			  addressline2: '',
			  city: '',
			  state: '',
			  country: 'USA',
			  zipcode: '',
			  email: 'na@default',
			  phone: '',
			  latitude:0.0,
			  longitude:0.0
	  };
	  $scope.showNewMarketForm=false;
  };
  function getPrimary(_market) {
    var _foundprimary = false;
    var _cnt = _market.MarketAddressBooks.length;
    var _primary = {
      MarketId: _market.id,
      name:_market.name,
      isdeleted:_market.isdeleted,
      ContactId:undefined,
      ContactName:'',
      ContactAddressBookId: undefined,
      address:'',
      addressline1: '',
      addressline2: '',
      state:'',
      city: '',
      country: '',
      email: '',
      phone: '',
      zipcode: undefined
    };      
    
    if (_cnt>0){
      var _i=0;
      _primary = {
        MarketId: _market.id,
        name:_market.name,
        isdeleted:_market.isdeleted,
        ContactId:_market.MarketContacts[_i].id,
        ContactName:_market.MarketContacts[_i].name,
        ContactAddressBookId: _market.MarketAddressBooks[_i].id,
        address:_market.MarketAddressBooks[_i].formattedaddress,
        addressline1: _market.MarketAddressBooks[_i].addressline1,
        addressline2: _market.MarketAddressBooks[_i].addressline2,
        state:'CA',
        city: _market.MarketAddressBooks[_i].city,
        country: _market.MarketAddressBooks[_i].country,
        email: _market.MarketAddressBooks[_i].email,
        phone: _market.MarketAddressBooks[_i].phone,
        zipcode: _market.MarketAddressBooks[_i].zipcode
      };      
    }
    /*
    for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
      if (_market.MarketAddressBooks[_i].isprimary == 1) {
        _abcnt = _market.MarketContacts[_i].MarketContactAddressBooks.length;
        for (_j = 0; _j < _abcnt && !_foundprimary; _j++) {
          if (_market.MarketContacts[_i].MarketContactAddressBooks[_j].isprimary == 1) {
            _primary = {
              MarketId: _market.id,
              name:_market.name,
              isdeleted:_market.isdeleted,
              ContactId:_market.MarketContacts[_i].id,
              ContactName:_market.MarketContacts[_i].name,
              ContactAddressBookId: _market.MarketContacts[_i].MarketContactAddressBooks[_j].id,
              addressline1: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline1,
              addressline2: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline2,
              state:'CA',
              city: _market.MarketContacts[_i].MarketContactAddressBooks[_j].city,
              country: _market.MarketContacts[_i].MarketContactAddressBooks[_j].country,
              email: _market.MarketContacts[_i].MarketContactAddressBooks[_j].email,
              phone: _market.MarketContacts[_i].MarketContactAddressBooks[_j].phone,
              zipcode: _market.MarketContacts[_i].MarketContactAddressBooks[_j].zipcode,
            };
            _foundprimary = true;
          }
        }
        if (!_foundprimary) {
          _j--;
          _primary = {
            MarketId: _market.id,
            name:_market.name,
            isdeleted:_market.isdeleted,
            ContactId:_market.MarketContacts[_i].id,
            ContactName:_market.MarketContacts[_i].name,
            ContactAddressBookId: _market.MarketContacts[_i].MarketContactAddressBooks[_j].id,
            addressline1: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline1,
            addressline2: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline2,
            city: _market.MarketContacts[_i].MarketContactAddressBooks[_j].city,
            state:'CA',
            country: _market.MarketContacts[_i].MarketContactAddressBooks[_j].country,
            email: _market.MarketContacts[_i].MarketContactAddressBooks[_j].email,
            phone: _market.MarketContacts[_i].MarketContactAddressBooks[_j].phone,
            zipcode: _market.MarketContacts[_i].MarketContactAddressBooks[_j].zipcode,
          };
          _foundprimary = true;
        }
      }
    }
    if (!_foundprimary) {
      _j = 0;
      for (_i = 0; _i < _cnt && !_foundprimary; _i++) {
        _abcnt = _data.MarketContacts[_i].MarketContactAddressBooks.length;
        if (_abcnt > 0) {
          _j = 0;
          _primary = {
            MarketId: _market.id,
            name:_market.name,
            isdeleted:_market.isdeleted,
            ContactId:_market.MarketContacts[_i].id,
            ContactName:_market.MarketContacts[_i].name,
            ContactAddressBookId: _market.MarketContacts[_i].MarketContactAddressBooks[_j].id,
            addressline1: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline1,
            addressline2: _market.MarketContacts[_i].MarketContactAddressBooks[_j].addressline2,
            city: _market.MarketContacts[_i].MarketContactAddressBooks[_j].city,
            state:'CA',
            country: _market.MarketContacts[_i].MarketContactAddressBooks[_j].country,
            email: _market.MarketContacts[_i].MarketContactAddressBooks[_j].email,
            phone: _market.MarketContacts[_i].MarketContactAddressBooks[_j].phone,
            zipcode: _market.MarketContacts[_i].MarketContactAddressBooks[_j].zipcode,
          };
          _foundprimary = true;
        }
      }
    }
    */
    return _primary;
  };
  if($dataType=='markets'){
      $scope.by_market="";
      $scope.markets=[];
    _count=$marketdata.data.data.length;
    for(_c=0;_c<_count;_c++){
      _data=$marketdata.data.data[_c];
      _cnt=_data.length;
      _i=0; _j=0;
      $scope.markets.push(_data);
      /*
      _abcnt = _data.MarketContacts[_i].MarketContactAddressBooks.length;
      if (_abcnt > 0) {
          _primary = {
            id: _data.id,
            name: _data.name,
            isdeleted: _data.isdeleted,
            ContactId:_data.MarketContacts[_i].id,
            ContactAddressBookId: _data.MarketContacts[_i].MarketContactAddressBooks[_j].id,
            ContactName: _data.MarketContacts[_i].name,
            address: _data.MarketContacts[_i].MarketContactAddressBooks[_j].formattedaddress,
            state:'CA',
            city: _data.MarketContacts[_i].MarketContactAddressBooks[_j].city,
            phone: _data.MarketContacts[_i].MarketContactAddressBooks[_j].phone,
            zipcode: _data.MarketContacts[_i].MarketContactAddressBooks[_j].zipcode,
          };
      }else{
          _primary = {
            id: _data.id,
            name: _data.name,
            isdeleted: _data.isdeleted,
            ContactName:'n/a',
            ContactId:0,
            ContactAddressBookId:0,
            state:'CA',
            address:'n/a',
            city: 'n/a',
            phone: 'n/a',
            zipcode: 'n/a',
          };
      }
      $scope.markets.push(_primary);
      */
      
    }
  }
  if($dataType=='market') {
    _data = $marketdata.data.data;
    _primary = getPrimary(_data);
    $scope.market = {
      id: _data.id,
      name: _data.name,
      isdeleted:_data.isdeleted,
      createdAt: _data.createdAt,
      updatedAt: _data.updatedAt,
    };
    $scope.market.primary = angular.copy(_primary);
    $scope.backup = angular.copy(_primary);

    $scope.DisableMarket=function(){
      $marketservice.disable($scope.market.id).success(function(data){
          if(data.rc>=0){
            $scope.market.primary.isdeleted=1;
            $scope.backup.isdeleted=1;
          }
      });
    };

    $scope.EnableMarket=function(){
      $marketservice.enable($scope.market.id).success(function(data){
          if(data.rc>=0){
            $scope.market.primary.isdeleted=0;
            $scope.backup.isdeleted=0;
          }
      });
    };

    $scope.cancelUpdateMarket=function(){
      $scope.backup=angular.copy($scope.market.primary);
    };

    $scope.updateMarket=function(){
      $marketservice.update($scope.market.id,$scope.backup).success(function(data){
          if(data.rc>=0){
            $scope.market.primary = angular.copy($scope.backup);
          }
        });
    };
    $scope.newvendor={
            name: '',
            marketid:$scope.market.id,
            marketname:$scope.market.primary.name,
            contactname: undefined,
            addressline1: '',
            addressline2: 'none',
            city: '',
            state: '',
            country: 'USA',
            zipcode: '',
            email: 'na@default',
            phone: '',
            latitude:0.0,
            longitude:0.0
    };
    $scope.showNewVendorForm=false;
    $scope.addNewVendorForm=function(){
        $scope.newvendor={
            name: '',
            marketid:$scope.market.id,
            marketname:$scope.market.primary.name,
            contactname: undefined,
            addressline1: '',
            addressline2: 'none',
            city: '',
            state: '',
            country: 'USA',
            zipcode: '',
            email: 'na@default',
            phone: '',
            latitude:0.0,
            longitude:0.0
        };
        $scope.showNewVendorForm=true;
    };
    $scope.cancelNewVendorForm=function(){
        $scope.newvendor={
            name: '',
            marketid:$scope.market.id,
            marketname:$scope.market.primary.name,
            contactname: undefined,
            addressline1: '',
            addressline2: 'none',
            city: '',
            state: '',
            country: 'USA',
            zipcode: '',
            email: 'na@default',
            phone: '',
            latitude:0.0,
            longitude:0.0
        };
        $scope.showNewVendorForm=false;
    };
    $scope.addVendor=function(newvendor){
     newvendor.street=newvendor.addressline1+" "+newvendor.addressline2;
     $vendorservice.create(newvendor).success(function(data){
         if(data.rc>=0){
          //  $state.go('app.user.vendor',{usertype: $scope.user.usertype,userid:$scope.user.id,vendorid:data.VendorId});
            	$scope.showNewVendorForm=false;
              $scope.$broadcast('$MarketAddedVendor',{'newvendor':response.data});
         }
       });
      
        // $marketservice.addVendor(newvendor).success(function(response){
        //     if(response.rc>=0){
        //     	$scope.showNewVendorForm=false;
        //         $scope.$broadcast('$MarketAddedVendor',{'newvendor':response.data});
        //     }
        //   });
    };
  }
}])
.controller('DashboardController',['$state','$scope','$userservice','$utilityservice','$orderservice','$orderdata','$timeout','$uibModal',function($state,$scope,$userservice,$utilityservice,$orderservice,$orderdata,$timeout,$uibModal){
  $scope.by_order="";
  $scope.by_order_status=0;
  $scope.orders=$orderdata;
  $scope.now=$utilityservice.formatDate($utilityservice.now());
  $scope.order_view=0;
  $scope.selectedOrder=undefined;
  function buildData(data){
    var _label=[];
    var _new=[];
    var _assigned=[];
    var _delivered=[];
    var _inprogress=[];
    var _newc=0;
    var _assignedc=0;
    var _deliveredc=0;
    var _inprogressc=0;
    var _orders=[];
    if(angular.isArray(data)){
      var _l=data.length;
      for(var _i=0;_i<_l;_i++){
        data[_i].scheduleAt=$utilityservice.formatDate(data[_i].scheduleAt);
        data[_i].deliveryAt=$utilityservice.formatDate(data[_i].deliveryAt);
        data[_i].accepted_vendors=0;
		    data[_i].by_order_status=1;
        var _vl=data[_i].OrderVendors.length;
        for(var _vi=0;_vi<_vl;_vi++){
          if(data[_i].OrderVendors[_vi].status!="new"){
            data[_i].accepted_vendors++;
          }
        }
        if(data[_i].status=="new"){
          _newc++;
         data[_i].by_order_status=1;
        }else if(data[_i].status=="delivered"){
          _deliveredc++;
		      data[_i].by_order_status=3;
        }else if(data[_i].status=="pick up complete"){
          _inprogressc++;
		      data[_i].by_order_status=2;
        }else{
          _newc++;
		      data[_i].by_order_status=1;
        }
        data[_i].loading=0;
        _orders[data[_i].id]=data[_i];
      }
    }
    var _data={
      'orders':[],
      'counts':[]
    };
    _data.counts.push(_newc);
    _data.counts.push(_assignedc);
    _data.counts.push(_deliveredc);
    _data.counts.push(_inprogressc);
    _data.orders=_orders;
    return _data;
  }

  var _data=buildData($orderdata.data.data);
  $scope.show_order=function(order,parentSelector){
      if($scope.screen.width<=768){
        $scope.show_order_as_modal(order,parentSelector);
      }else{
        $scope.show_order_as_side(order);
      }
  };
  $scope.show_order_as_side=function(order){
      $scope.order_view=1;
      order.loading=1;
      $scope.selectedOrder=order;
      $orderservice.getById(order.id).then(function(response){
        $scope.order_view=2;
        var _data=[];
        _data.push(response.data.data);
        var _id=response.data.data.id;
        var _order=buildData(_data);
        _data=undefined;
        $scope.selectedOrder=_order.orders[_id];
        $scope.orders[_id]=_order.orders[_id];
      }).catch(function(error){
        console.log(error);
      });
  };

  $scope.show_order_as_modal=function(order,parentSelector){
	  $scope.order_view=1;
    order.loading=1;
    $scope.selectedOrder=order;
    var parentElem = undefined;
    if(parentSelector){
      parentElem = angular.element($document[0].querySelector('.modal-demo ' + parentSelector));
    }
    var modalInstance = $uibModal.open({
      animation: false,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'modal.order.html',
      controller: function ($scope,$uibModalInstance,$orderdata,$utilityservice) {
          var $ctrl=this;
          $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selectedOrder);
          };
          $ctrl.cancel = function () {
            $uibModalInstance.dismiss($ctrl.selectedOrder);
          };
          $ctrl.selectedOrder=$orderdata.data.data;
          $ctrl.selectedOrder.scheduleAt=$utilityservice.formatDate($orderdata.data.data.scheduleAt);
          $ctrl.selectedOrder.deliveryAt=$utilityservice.formatDate($orderdata.data.data.deliveryAt);
      },
      controllerAs: '$ctrl',
      size: "lg",
      appendTo: parentElem,
      resolve:{
        $orderdata:['$stateParams','$orderservice',
          function($stateParams,$orderservice){
            return $orderservice.getById(order.id);
        }]
      }
    });
    modalInstance.result.then(function (selectedOrder) {
        $scope.orders[selectedOrder.id]=angular.copy(selectedOrder);
        $scope.orders[selectedOrder.id].loading=0;
      }, function (selectedItem) {
        $scope.orders[$scope.selectedOrder.id].loading=0;
      });
	  return true;
  };
  $scope.hide_order=function(){
	  $scope.order_view=0;
	  return true;
  };


  $scope.orders=_data.orders;
  $scope.new_orders=_data.counts[0];
  $scope.assigned_orders=_data.counts[1];
  $scope.delivered_orders=_data.counts[2];
  $scope.inprogress_orders=_data.counts[3];
  $scope.screen=$utilityservice.getScreenSize();
  _data=undefined;
}])
.controller('appViewController',function($rootScope,$scope,$state,$restservice,$userservice,$mdDialog) {
	$scope.viewclass=$rootScope.viewclass;
	$scope.$on('$ViewClassUpdated',function(response){
		$scope.viewclass=$rootScope.viewclass;
	});
    $scope.load=function(path){
      $state.go(path);
    };
    $scope.entity={
        'username':'',
        'password':''
    };
    $scope.isLogged=$rootScope.isLogged;
    var _user=$userservice.getDetails();
    if(_user && _user['id']!=undefined){
    	$rootScope.viewclass="hold-transition fixed lockscreen";
    	$scope.viewclass=$rootScope.viewclass;
        $scope.isLogged=true;
        $rootScope.isLocked=true;
        $rootScope.token=_user.token;
        $scope.$broadcast('$UserLogged', { success: true,authkey:_user.token});
    }
    $scope.login=function(){
        $userservice.login($scope.entity).then(function(response){
            if(response.data.rc==-1){
              $scope.processing=false;
              $scope.errormessage="Invalid Details";
              $scope.entity.password.$dirty=true;
            }else{
                $scope.isLogged=true;
                $rootScope.isLogged=true;
                $rootScope.token=response.data.data.authkey;
                $scope.entity.password="";
                $userservice.put(response.data.data.id,response.data.data.authkey,(response.data.data.type).toLowerCase());
                var _user=$userservice.getDetails();
                if(typeof _user.then=="function"){
                    _user.then(function(response){
                    	$userservice.save('details',{'menu':response.data.menuoptions,'token':$rootScope.token,'id':response.data.details.id,'email':response.data.details.email,'name':response.data.details.name,'type':(response.data.details.type).toLowerCase()});
                        $scope.$broadcast('$UserLogged', { success: true,authkey:$rootScope.token });
                        $state.go('app.user.dashboard',{usertype:(response.data.details.type).toLowerCase(),userid:response.data.details.id});
                    });
                }else{
                	$userservice.save('details',{'menu':response.data.menuoptions,'token':$rootScope.token,'id':_user.id,'email':_user.email,'name':_user.name,'type':_user.type});
                    $scope.$broadcast('$UserLogged', { success: true,authkey:$rootScope.token });
                    $state.go('app.user.dashboard',{usertype:(_user.type).toLowerCase(),userid:_user.id});
                }
            }
        }).catch(function(error){
        	$rootScope.viewclass="hold-transition loginscreen";
        	$scope.viewclass=$rootScope.viewclass;
        	$state.go('app.login');
        });
    };
    // $scope.$on('$UserExpired', function(event){
    //         $scope.isLogged=false;
    // });
    // $scope.$on('$stateNotFound', function(event,args){
    //   $mdDialog.show(
    //     $mdDialog.alert()
    //       .parent(angular.element(document.querySelector('#appcontainer')))
    //       .clickOutsideToClose(true)
    //       .title("error")
    //       .textContent("Invalid Request")
    //       .ariaLabel('Alert Dialog')
    //       .ok('Ok')
    //   );
    // });
  })
;
/* routers */
angular
.module('store', ['ui.router', 'store.controllers','store.services','angular-cache','angular-md5','ngFileUpload','ui.bootstrap','chart.js'])
.directive('showtab',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function(e) {
                    e.preventDefault();
                    $(element).tab('show');
                });
            }
        };
})
.run(function ($rootScope, $state, $stateParams,$http,$userservice) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$domain="http://dev.freshcarton.com";
    $rootScope.isLogged=false; 
    $rootScope.isLocked=false;
    $rootScope.viewclass="hold-transition";
    $rootScope.page="login";
    var _usr=$userservice.get();
    if(_usr==undefined){
        console.log("user not found at begin");
        $state.go('app.login');
    }else{
        $rootScope.isLogged=(_usr.id)?_usr.id:false;
        $rootScope.token=(_usr.token)?_usr.token:'undefined';
    }
    $rootScope.$watch('viewclass',function(newValue,OldValue){
    	$rootScope.$broadcast('$ViewClassUpdated', {'newValue': newValue,'OldValue':OldValue});
    });
    $rootScope.display_view_progress_bar=true;
    $rootScope.$on('$UserLogged', function(event,args){
        $rootScope.isLogged=args.success;
        $rootScope.token=args.token;
        $rootScope.isLocked=false;
    });
    $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
          $rootScope.display_view_progress_bar=true;
    });
	/*
    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams){
          $rootScope.display_view_progress_bar=false;
    });
	*/
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
//		alert("Sorry! Something went wrong");
//        $userservice.remove();
//        $rootScope.isLogged=false;
//        $rootScope.token=undefined;
        console.log("on state error");
        console.log(error);
//        $state.go('app.login');
    });
    $rootScope.$on('$stateNotFound',
    function(event, unfoundState, fromState, fromParams){
        $rootScope.display_view_progress_bar=true;
        console.log('$stateNotFound');
    });
    $rootScope.$on('$UserExpired',
    function(event){
        $userservice.remove();
        $rootScope.isLogged=false;
        $rootScope.isLocked=true;
        console.log("on user expired");
        $state.go("app.login");
    });
})
.config(function (CacheFactoryProvider) {
  angular.extend(CacheFactoryProvider.defaults, { maxAge: 90 * 90 * 1000 });
})
.config(['$httpProvider',function($httpProvider) {
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.headers.get = {};
    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    //$httpProvider.defaults.headers.get['x-session-token']= $rootScope.token;
    $httpProvider.interceptors.push('sessionInjector');
}])
.config(['ChartJsProvider', function (ChartJsProvider) {
  // Configure all charts
  ChartJsProvider.setOptions({
    chartColors: ["rgba(0, 192, 239,0.5)","rgba(0, 166, 90,0.7)","rgba(243, 156, 18,0.5)","rgba(51, 122, 183,0.5)"],
    responsive: true
  });
  // Configure all line charts
  ChartJsProvider.setOptions('line', {
    showLines: true
  });
}])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
  $stateProvider
    .state('app', {
      abstract: true,
      url: '/app',
      templateUrl: '/www/views/app.html',
      controller: 'appViewController'
    })
    .state('app.login', {
    url: '/login',
      views:{
        "content":{
          templateUrl: '/www/views/login.html',
        }
      }
    })
    .state('app.lock', {
    url: '/lock',
      views:{
        "content":{
          templateUrl: function($rootScope){
              return '/www/views/lock.html';
        	  // if($rootScope.isLocked){
        		//   $rootScope.viewclass="hold-transition lockscreen";
            // 	  return '/www/views/lock.html';
        	  // }else{
        		//   $rootScope.viewclass="hold-transition loginscreen";
        		//   return '/www/views/login.html';
        	  // }
          },
        }
      }
    })
    .state('app.user', {
     url: '/user',
     abstract: true,
      views:{
        "content":{
          templateUrl:'/www/views/app.html',
        }
      }
    })
    .state('app.user.dashboard', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/dashboard/',
      views:{
        "content":{
          templateUrl: function($rootScope){
        	  $rootScope.page="dashboard";
        	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
        	  return '/www/views/'+$rootScope['usertype']+'/layout.html';
          }
        },
        "body@app.user.dashboard":{
            templateUrl: function($rootScope){
          	  return '/www/views/'+$rootScope['usertype']+'/dashboard.html';
            },
            controller: 'DashboardController'
          }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
        $orderType:function(){return "dashboard";},
        $orderdata:['$stateParams','$orderservice',
          function($stateParams,$orderservice){
            return $orderservice.get({offset:30});
        }]
      }
    })
    .state('app.user.orders', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/orders/',
      views:{
          "content":{
            templateUrl: function($rootScope){
              $rootScope.page="orders";
          	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
          	  return '/www/views/'+$rootScope['usertype']+'/layout.html';
            },
          },
          "body@app.user.orders":{
              templateUrl: function($rootScope){
            	  return '/www/views/'+$rootScope['usertype']+'/orders.html';
              },controller: 'OrderController',
            }
        },
      resolve:{
          $menudata:function(){return undefined;},
          $orderType:function(){return "orders";},
          $orderdata:['$stateParams','$orderservice',
            function($stateParams,$orderservice){
              return $orderservice.get();
            }]
      }
    })
    .state('app.user.order', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/orders/{orderid:[a-zA-Z0-9]+}/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="orders";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
          "body@app.user.order":{
        	  templateUrl: function($rootScope){
        		  return '/www/views/'+$rootScope['usertype']+'/order.html'
          },
          controller: 'OrderController',
        }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
          $orderType:function(){return "order";},
          $orderdata:['$stateParams','$orderservice',
            function($stateParams,$orderservice){
              return $orderservice.getById($stateParams['orderid']);
            }]
      },
    })
    .state('app.user.products', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/products/',
      views:{
        "menu":{
          templateUrl: '/www/views/menu.html',
          controller: 'MenuController',
        },
        "content":{
          templateUrl: function($stateParams){return '/www/views/'+$stateParams['usertype']+'/products.html'},
          controller: 'ProductController',
        }
      },
      resolve:{
          $menudata:['$stateParams','$userservice',
            function($stateParams,$userservice){
              return $userservice.getDetails();
            }],
          $productType:function(){return "products";},
          $productdata:['$stateParams','$productservice',
            function($stateParams,$productservice){
              return $productservice.get();
            }]
      }
    })
    .state('app.user.product', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/products/{productid:[a-zA-Z0-9]+}/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="vendors";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
        "body@app.user.product":{
            templateUrl: function($rootScope){return '/www/views/'+$rootScope['usertype']+'/product.html'},
            controller: 'ProductController',
        }
      },
      resolve:{
          $menudata:['$stateParams','$userservice',
            function($stateParams,$userservice){
              return $userservice.getDetails();
            }],
          $productType:function(){return "product";},
          $productdata:['$stateParams','$productservice',
            function($stateParams,$productservice){
              return $productservice.getById($stateParams['productid']);
            }]
      },
    })
    .state('app.user.vendors', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/vendors/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="vendors";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
          "body@app.user.vendors":{
              templateUrl: function($rootScope){return '/www/views/'+$rootScope['usertype']+'/vendors.html'},
              controller: 'VendorController',
          }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
          $dataType:function(){return "vendors";},
          $marketdata:function(){return ''},
          $vendordata:['$stateParams','$vendorservice',
            function($stateParams,$vendorservice){
              return $vendorservice.get();
            }],
      }
    })
    .state('app.user.vendor', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/vendors/{vendorid:[a-zA-Z0-9]+}/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="vendors";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
	        "body@app.user.vendor":{
	          templateUrl: function($rootScope){
	              return '/www/views/'+$rootScope['usertype']+'/vendor.html'
	          },
	          controller: 'VendorController',
	        },
	        "vendorproducts@app.user.vendor":{
		          templateUrl: function($rootScope){
		              return '/www/views/'+$rootScope['usertype']+'/vendor.products.html'
		          },
		          controller: 'ProductController',
		     },
	        "vendororders@app.user.vendor":{
		          templateUrl: function($rootScope){
		              return '/www/views/'+$rootScope['usertype']+'/vendor.orders.html'
		          },
		          controller: 'OrderController',
		     }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
          $dataType:function(){return "vendor";},
          $productType:function(){return "products";},
          $orderType:function(){return "orders";},
          $vendordata:['$stateParams','$vendorservice',
            function($stateParams,$vendorservice){
              return $vendorservice.getById($stateParams['vendorid']);
            }],
          $orderdata:['$stateParams','$orderservice',
            function($stateParams,$orderservice){
              return $orderservice.getByVendor($stateParams['vendorid']);
            }],
          $productdata:['$stateParams','$productservice',
            function($stateParams,$productservice){
              return $productservice.getByVendor($stateParams['vendorid']);
            }],
          $marketdata:['$stateParams','$marketservice',
            function($stateParams,$marketservice){
              return $marketservice.getMarketNames();
            }]
      },
    })
    .state('app.user.customers', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/customers/',
      views:{
        "content":{
            templateUrl: function($rootScope){
              $rootScope.page="vendors";
              $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
              return '/www/views/'+$rootScope['usertype']+'/layout.html'
            }
          },
        "body@app.user.customers":{
	          templateUrl: function($rootScope){
	              return '/www/views/'+$rootScope['usertype']+'/customers.html'
	          },
	          controller: 'CustomerController',
	      },
      },
      resolve:{
          $menudata:function(){return undefined;},
          $dataType:function(){return "customers";},
          $customerdata:['$stateParams','$customerservice',
            function($stateParams,$customerservice){
              return $customerservice.get();
            }]
      }
    })
    .state('app.user.customer', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/customers/{customerid:[a-zA-Z0-9]+}/',
      views:{
        "content":{
            templateUrl: function($rootScope){
              $rootScope.page="vendors";
              $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
              return '/www/views/'+$rootScope['usertype']+'/layout.html'
            }
          },
          "body@app.user.customer":{
  	          templateUrl: function($rootScope){
  	              return '/www/views/'+$rootScope['usertype']+'/customer.html'
  	          },
  	          controller: 'CustomerController',
  	      },
          "customerorders@app.user.customer":{
		          templateUrl: function($rootScope){
		              return '/www/views/'+$rootScope['usertype']+'/customer.orders.html'
		          },
		          controller: 'OrderController',
		     }
      },
      resolve:{
          $menudata:function(){return undefined;},
          $dataType:function(){return "customer";},
          $customerdata:['$stateParams','$customerservice',
            function($stateParams,$customerservice){
              return $customerservice.getById($stateParams['customerid']);
            }],
          $orderType:function(){return "orders";},
          $orderdata:['$stateParams','$orderservice',
      		  function($stateParams,$orderservice){
      		    return $orderservice.getByCustomer($stateParams['customerid']);
      		  }],
      },
    })
    .state('app.user.employees', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/employees/',
      views:{
        "content":{
            templateUrl: function($rootScope){
              $rootScope.page="vendors";
              $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
              return '/www/views/'+$rootScope['usertype']+'/layout.html'
            }
          },
        "body@app.user.employees":{
	          templateUrl: function($rootScope){
	              return '/www/views/'+$rootScope['usertype']+'/employees.html'
	          },
	          controller: 'EmployeeController',
	      },
      },
      resolve:{
        $menudata:function(){return undefined;},
        $dataType:function(){return "employees";},
        $employeedata:['$stateParams','$employeeservice',
            function($stateParams,$employeeservice){
              return $employeeservice.get();
            }]
        }
    })
    .state('app.user.employee', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/employees/{employeeid:[a-zA-Z0-9]+}/',
      views:{
        "content":{
            templateUrl: function($rootScope){
              $rootScope.page="vendors";
              $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
              return '/www/views/'+$rootScope['usertype']+'/layout.html'
            }
          },
          "body@app.user.employee":{
  	          templateUrl: function($rootScope){
  	              return '/www/views/'+$rootScope['usertype']+'/employee.html'
  	          },
  	          controller: 'EmployeeController',
  	      },
          "employeeorders@app.user.employee":{
		          templateUrl: function($rootScope){
		              return '/www/views/'+$rootScope['usertype']+'/employee.orders.html'
		          },
		          controller: 'OrderController',
		     }
      },
      resolve:{
          $menudata:function(){return undefined;},
          $dataType:function(){return "employee";},
          $employeedata:['$stateParams','$employeeservice',
            function($stateParams,$employeeservice){
              return $employeeservice.getById($stateParams['employeeid']);
            }],
          $orderType:function(){return "orders";},
          $orderdata:['$stateParams','$orderservice',
      		  function($stateParams,$orderservice){
      		    return $orderservice.getByEmployee($stateParams['employeeid']);
      		  }],
      },
    })
   .state('app.user.markets', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/markets/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="markets";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
          "body@app.user.markets":{
              templateUrl: function($rootScope){return '/www/views/'+$rootScope['usertype']+'/markets.html'},
              controller: 'MarketController',
          }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
          $dataType:function(){return "markets";},
          $marketdata:['$stateParams','$marketservice',
            function($stateParams,$marketservice){
              return $marketservice.get();
            }],
      }
    })
    .state('app.user.market', {
      url: '/{usertype:[a-zA-Z0-9]+}@{userid:[a-zA-Z0-9]+}/markets/{marketid:[a-zA-Z0-9]+}/',
      views:{
          "content":{
              templateUrl: function($rootScope){
            	  $rootScope.page="markets";
            	  $rootScope.viewclass="hold-transition skin-blue fixed layout-top-nav";
            	  return '/www/views/'+$rootScope['usertype']+'/layout.html'
              }
            },
	        "body@app.user.market":{
	          templateUrl: function($rootScope){
	              return '/www/views/'+$rootScope['usertype']+'/market.html'
	          },
	          controller: 'MarketController',
	        },
	        "marketvendors@app.user.market":{
		          templateUrl: function($rootScope){
		              return '/www/views/'+$rootScope['usertype']+'/market.vendors.html'
		          },
		          controller: 'VendorController',
		     }
      },
      resolve:{
    	  $menudata:function(){return undefined;},
          $dataType:function(){return "market";},
          $productType:function(){return "products";},
          $orderType:function(){return "orders";},
          $marketdata:['$stateParams','$marketservice',
            function($stateParams,$marketservice){
              return $marketservice.getById($stateParams['marketid']);
          }],
          $vendordata:['$stateParams','$vendorservice',
            function($stateParams,$vendorservice){
              return $vendorservice.getByMarketId($stateParams['marketid']);
          }]
      },
    })    
  ;
  $urlRouterProvider.otherwise("/app/login");
}])
;
