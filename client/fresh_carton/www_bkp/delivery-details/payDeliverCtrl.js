/*
 * Description:         This controller is related to address validation 
 *                      and redirecting to next vendor listing page
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
freshMarketApp.controller('payDeliverCtrl', function ($scope, $rootScope, $http, $ionicPopup,$location, $timeout,$paymentservice) {
    $scope.loading = true;
    $rootScope.showSearch = false;
                          if($rootScope.showCart ==undefined || $rootScope.showCart != 3){
                            $location.path('/address');
                            $rootScope.showCart=0;
                          }else{
                            $rootScope.showCart=0;
                            openInitial();
                          }

    function openInitial() {
        //var customerDetails = JSON.parse(localStorage.getItem('authCred'));
        var productDetails = JSON.parse(localStorage.getItem('cartedItems'));
        var payAbleAmount = parseFloat(productDetails.paymentDetails.payableAmount);
        $scope.payAbleAmount = payAbleAmount.toFixed(2);
        paymentGateway();
//        var userId = customerDetails.userData.id;
//        var userAuthToken = customerDetails.userData.authkey;
//        var api_url = baseUrl + "customer/" + userId + "/createordertoken?token=" + userAuthToken;
//        $http({
//            method: 'GET',
//            url: api_url,
//            data: {}
//        }).then(function (response) {
//            var result = response.data;
//            if (result.rc === 0) {
//                var encodedValue = atob(result.token);
//                var paypalObj = JSON.parse(encodedValue);
//                paymentGateway(paypalObj);
//            }
//        }, function (response) {
//            var alertPopup = $ionicPopup.alert({
//                title: 'Oops',
//                template: "Something went wrong while processing your request."
//            });
//            $timeout(function () {
//                alertPopup.close();
//            }, 2000);
//        });
    }

    function paymentGateway() {
        var clientToken =  $paymentservice.getToken();
        console.log(clientToken);
        //var clientToken = 'sandbox_dpkzjg9m_2t62rpghphf9nmjv';
        braintree.setup(clientToken, "dropin", {
            container: "payment-form",
            onPaymentMethodReceived: function (token) {
                placeOrder(token);
            }
        });
        $scope.loading = false;
    }

    function placeOrder(token) {
        var customerDetails = JSON.parse(localStorage.getItem('authCred'));
        var userId = customerDetails.userData.id;
        var userAuthToken = customerDetails.userData.authkey;
        var productDetails = JSON.parse(localStorage.getItem('cartedItems'));
        var orderObj = productDetails.orderObj;
        
        orderObj.payment_none = token.nonce;
        orderObj.tips = 1;
        var orderId = productDetails.paymentDetails.order;

        var encodedOrderValue = btoa(JSON.stringify(orderObj));
        var api_url = baseUrl + "customer/" + userId + "/confirmorder/" + orderId + "?token=" + userAuthToken;
        $http({
            method: 'POST',
            url: api_url,
            headers: {
                'Accept': 'application/x-www-form-urlencoded'
            },
            data: {"entity[json]": encodedOrderValue}
        }).then(function (response) {
            var result = response.data;
            if (result.rc === 0) {
                $scope.orderConfirm = true;
                $scope.orderSuccess = true;
                $scope.confirmToken = result.confirmation;
                removeCartedItems();
            } else {
                $scope.orderConfirm = true;
                $scope.orderSuccess = false;
                $scope.errorMessage = result.message;
            }
            $scope.loading = false;
        }, function (err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops',
                template: "Something went wrong while processing your request."
            });
            $timeout(function () {
                alertPopup.close();
            }, 2000);
        });
    }

    function removeCartedItems() {
        var cartedItems = {
            cartAmount: 0,
            cartCount: 0,
            cartedItems: [],
            cartedItemsId: []
        };
        localStorage.setItem('cartedItems', JSON.stringify(cartedItems));
        $rootScope.cartAmount = '$ 0.00';
        $rootScope.cartCount = 0;
        $rootScope.reload = true;
    }
});
