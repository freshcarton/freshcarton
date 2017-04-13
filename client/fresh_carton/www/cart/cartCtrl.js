/*
 * Description:         This controller is related to address validation 
 *                      and redirecting to next vendor listing page
 * @author:             Kiran Kumar Talapaku (kiran.talapaku@gmail.com)
 * @copyright:          Fresh Carton LLC
 * @version:            1.0.1
 */
freshMarketApp.controller('cartCtrl', function ($scope, $rootScope, $location, $ionicModal, $http, $ionicPopup, $timeout,$ionicNavBarDelegate) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    $scope.dataAvailable = false;
    $scope.cartVendors=[];
    $scope.cartVendorIds=[];

    if($rootScope.showCart ==undefined || $rootScope.showCart >1){
        $location.path('/address');
        $rootScope.showCart=1;
    }else{
        openInitial();
    }

    
    function openInitial() {
        $scope.cartVendors=[];
        $scope.cartVendorIds=[];

        var cartedProducts = JSON.parse(localStorage.getItem('cartedItems'));
        $scope.cartedProducts = cartedProducts.cartedItems;
        if(cartedProducts.cartedItemsId.length===0){
            $scope.dataAvailable = false;
        }else{
            var _cl=$scope.cartedProducts.length;
            var _vdr=[];
            while(_cl--){
                key = $scope.cartedProducts[_cl].vendorDtails.id;
                if($scope.cartVendorIds.indexOf(key)>=0){
                    continue;
                }else{
                    $scope.cartVendorIds.push($scope.cartedProducts[_cl].vendorDtails.id);
                    $scope.cartVendors.push($scope.cartedProducts[_cl].vendorDtails);
                }
            }
            $scope.dataAvailable = true;
        }
        $scope.loading = false;
    }

    $scope.removeItem = function (product) {
        $scope.loading = true;
        var existedProducts = JSON.parse(localStorage.getItem('cartedItems'));
        var prodId = product.id;
        var arrIndex = existedProducts.cartedItemsId.indexOf(prodId);
        if (arrIndex !== (-1)) { /* not previously added */
            existedProducts.cartedItemsId.splice(arrIndex, 1);
            existedProducts.cartedItems.splice(arrIndex, 1);
        }
        $scope.cartedProducts = existedProducts.cartedItems;
        calculateAndSave(existedProducts);
    };

    $scope.reducProductQuantity = function (product) {
        if (product.quantity <= 1) {
            product.quantity = 1;
        } else {
            product.quantity--;
        }
        addToCart(product);
    };

    $scope.incProductQuantity = function (product) {
        product.quantity++;
        addToCart(product);
    };

    function addToCart(product) {
        var prodId = product.id;
        var cartendProducts = JSON.parse(localStorage.getItem('cartedItems'));
        $scope.loading = true;
        var arrIndex = cartendProducts.cartedItemsId.indexOf(prodId);
        if (arrIndex !== (-1)) { /*  previously added */
            cartendProducts.cartedItemsId.splice(arrIndex, 1);
            cartendProducts.cartedItems.splice(arrIndex, 1);
        }
        if (product.quantity > 0) {
            cartendProducts.cartedItemsId.push(prodId);
            cartendProducts.cartedItems.push(product);
        }
        calculateAndSave(cartendProducts);
    }

    function calculateAndSave(cartendProducts) {
        var cartAmount = 0;
        for (var i in cartendProducts.cartedItems) {
            var prod = cartendProducts.cartedItems[i];
            var quantity = prod.quantity;
            var pricePerUnit = prod.Inventories[0].unitprice;
            cartAmount = cartAmount + (parseFloat(pricePerUnit) * parseInt(quantity));
        }
        cartendProducts.cartAmount = cartAmount;
        cartendProducts.cartCount = cartendProducts.cartedItemsId.length;
        localStorage.setItem('cartedItems', JSON.stringify(cartendProducts));
        $rootScope.cartAmount = '$ ' + cartAmount.toFixed(2);
        $rootScope.cartCount = cartendProducts.cartCount;
      //  $scope.cartedProducts = cartendProducts.cartedItems;
        if(cartendProducts.cartCount){
            $scope.dataAvailable = true;
        }else{
            $scope.dataAvailable = false;
        }
        $scope.loading = false;
    }
    
    $scope.checkAndRedirect = function (){
        var customerDetails = JSON.parse(localStorage.getItem('authCred'));
        if (customerDetails.logged) {
            $rootScope.showCart=2;
            $location.path('app/delivery');
        }else{
            $scope.login();
        }
    };
    
    /* login details */
        /* open login pop up */
    $scope.login = function () {
        $scope.loginData = {};
        $ionicModal.fromTemplateUrl('app/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.register = function () {
        $scope.registerData = {};
        $ionicModal.fromTemplateUrl('app/register.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.openRegsiterPopUp = function () {
        $scope.closeLogin();
        $scope.register();
    };

    $scope.openloginPopUp = function () {
        $scope.closeLogin();
        $scope.login();
    };

    /* close pop up */
    $scope.closeLogin = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    $scope.doLogin = function () {
        var username = $scope.loginData.username;
        var password = $scope.loginData.password;
        var url = baseUrl + 'customer';

        var auth_token = btoa(username + ':' + password);
        $http({
            method: 'GET',
            headers: {
                'Authorization': "Basic " + auth_token,
                'Accept': 'application/json'
            },
            url: url
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    var userData = result.data;
                    var authCred = {
                        logged: true,
                        userData: userData,
                        userEmail: username
                    };
                    localStorage.setItem('authCred', JSON.stringify(authCred));
                    $rootScope.userEmail = username;
                    $rootScope.logged = true;
                    var alertPopup = $ionicPopup.alert({
                        title: 'Welcome!',
                        template: "Thank you for coming back."
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 1000);
                    $scope.closeLogin();
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: "Wrong user details."
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2000);
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: "Something went wrong,Please try again."
                });
                $timeout(function () {
                    alertPopup.close();
                }, 2000);
            }
        }, function (response) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops!',
                template: "Something went wrong,Please try again."
            });
            $timeout(function () {
                alertPopup.close();
            }, 2000);
        });
    };

    $scope.doRegister = function () {
        var url = baseUrl + 'customer/';
        var customerObj = {
            customer: {
                "email": $scope.registerData.useremail,
                "name": $scope.registerData.username,
                "password": $scope.registerData.password
            }
        };
        var encodedData = btoa(JSON.stringify(customerObj));
        $http({
            method: 'POST',
            url: url,
            headers: {
                'Accept': 'application/x-www-form-urlencoded'
            },
            data: {
                'entity[json]': encodedData
            }
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    var userData = result.data;
                    var authCred = {
                        logged: true,
                        userData: userData,
                        userEmail: $scope.registerData.useremail
                    };
                    localStorage.setItem('authCred', JSON.stringify(authCred));
                    $rootScope.userEmail = $scope.registerData.useremail;
                    $rootScope.logged = true;
                    var alertPopup = $ionicPopup.alert({
                        title: 'Welcome!',
                        template: "Thank you for registering with us."
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 1000);
                    $scope.closeLogin();
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Oops!',
                        template: "Something went wrong,Please try again."
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2000);
                    $scope.closeLogin();
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops!',
                    template: "Something went wrong,Please try again."
                });
                $timeout(function () {
                    alertPopup.close();
                }, 2000);
            }
        }, function (response) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops!',
                template: "Something went wrong,Please try again."
            });
            $timeout(function () {
                alertPopup.close();
            }, 2000);
        });
    };
});
