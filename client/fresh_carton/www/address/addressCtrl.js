/*
 * Description:         This controller is related to address validation 
 *                      and redirecting to next vendor listing page
 * @author:             Thanuja Bachala (bachalas@gmail.com) 
 * @copyright:          Fourcontacts (http://www.fourcontacts.com) & Freshcarton LLC (http://www.freshcarton.com)
 * @version:            2.0.0
 */
freshMarketApp.controller('addressCtrl', function ($scope, $rootScope, $location, $http, $ionicPopup, $timeout,$ionicModal) {
    //$scope.loading = true;
    if (localStorage.getItem('userAddress') === null) {
        $scope.address = {
            addressType:'',
            apt:'',
            city: '',
            state: '',
            street: '',
            zip:''

        }
    } else {
        try{
            var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
            $scope.address = {
                addressType:savedAddress.addressType,
                apt:savedAddress.apt,
                city: savedAddress.city,
                state: savedAddress.state,
                street: savedAddress.street,
                zip:savedAddress.zip
            };
            localStorage.removeItem('selectedMarket');
            localStorage.removeItem('selectedVendors');
            localStorage.removeItem('cartedItems');
            
        }    
        catch(e){
            console.log(e);
            $scope.address = {
                addressType:'',
                apt:'',
                city: '',
                state: '',
                street: '',
                zip:''
            }
            var address = JSON.stringify($scope.address);
            localStorage.setItem('userAddress', address);
             localStorage.removeItem('selectedMarket');
            localStorage.removeItem('selectedVendors');
            localStorage.removeItem('cartedItems');            
        }
    }
    $scope.loading = false;
    $scope.findVendos = function () {
        var street = '';
        var city = $scope.address.city;
        var state = $scope.address.state;
        var zipcode = $scope.address.zip;
        var address = JSON.stringify($scope.address);
        $http({
            method: 'GET',
            url: baseUrl + 'markets?zipcode=' + zipcode
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    console.log($scope.address);
                    var address = JSON.stringify($scope.address);
                    localStorage.setItem('userAddress', address);
                    $location.path('app/markets');
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Sorry',
                        template: "We will not deliver on this area"
                    });
                    $timeout(function () {
                        alertPopup.close(); 
                    }, 3000);
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Sorry',
                    template: "We will not deliver on this area"
                });
                $timeout(function () {
                    alertPopup.close(); 
                }, 3000);
            }
        }, function (response) {
            var alertPopup = $ionicPopup.alert({
                title: 'Sorry',
                template: "We will not deliver on this area"
            });
            $timeout(function () {
                alertPopup.close(); 
            }, 3000);
        });
    };
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
    };

    $scope.openDashboard=function(){
        $location.path('app/dashboard');
    }

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
});