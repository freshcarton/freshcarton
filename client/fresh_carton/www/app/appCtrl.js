/*
 * Description:         This controller is related to login and registration pop up
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */

freshMarketApp.controller('appCtrl', function ($scope, $ionicModal, $rootScope, $http, $ionicPopup, $timeout,$location) {
                          $rootScope.showCart=false;
    $scope.showCartButton=function(){
        var loc = $location.path();
                          //|| loc.indexOf("/delivery")>-1 || loc.indexOf("/pay")>-1
                          return loc.indexOf("/cart")>-1;
    }

                          $scope.showBackButton=function(){
                          var loc = $location.path();
                          return loc.indexOf("/delivery")>-1 || loc.indexOf("/pay")>-1
                          }

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

    $scope.logout = function () {
        var authCred = {
            logged: false
        };
        $rootScope.logged = false;
        localStorage.setItem('authCred', JSON.stringify(authCred));
        var cartedItems = {
            cartAmount: 0,
            cartCount: 0,
            cartedItems: [],
            cartedItemsId: []
        };
        localStorage.removeItem('selectedVendors');       
        localStorage.setItem('cartedItems', JSON.stringify(cartedItems));
        $rootScope.cartAmount = '$ 0.00';
        $rootScope.cartCount = 0;
        var alertPopup = $ionicPopup.alert({
            title: 'Fresh Carton',
            template: "Logout Sucessful"
        });
        $timeout(function () {
            alertPopup.close();
        }, 2000);

        $location.path('/address');
    };

    $scope.goToCart = function(){
       $rootScope.showCart=true; 
       $location.path('/app/cart');
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

    if (localStorage.getItem('cartedItems') === null) {
        var cartedItems = {
            cartAmount: 0,
            cartCount: 0,
            cartedItems: [],
            cartedItemsId: []
        };
        localStorage.setItem('cartedItems', JSON.stringify(cartedItems));
        $rootScope.cartAmount = '$ 0.00';
        $rootScope.cartCount = 0;

    } else {
        var cartedItems = JSON.parse(localStorage.getItem('cartedItems'));
        $rootScope.cartAmount = '$ ' + cartedItems.cartAmount.toFixed(2);
        $rootScope.cartCount = cartedItems.cartCount;
    }

    if (localStorage.getItem('authCred') === null) {
        var authCred = {
            logged: false
        };
        $rootScope.logged = false;
        localStorage.setItem('authCred', JSON.stringify(authCred));
    } else {
        var authCred = JSON.parse(localStorage.getItem('authCred'));
        if (authCred.logged) {
            $rootScope.logged = true;
            $rootScope.userEmail = authCred.userEmail;
        } else {
            $rootScope.logged = false;
        }
    }
//           var authCred = {
//        logged: true,
//        userData: {
//            "id": 2,
//            "authkey": "74878c41b8929765fc1d97c57a0ec934"
//        },
//        userEmail: 'test@email.com'
//    };
//    localStorage.setItem('authCred', JSON.stringify(authCred));
//    $rootScope.userEmail = 'test@email.com';
//    $rootScope.logged = true;
});
