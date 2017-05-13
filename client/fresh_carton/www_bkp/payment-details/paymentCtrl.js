/*
 * Description:         This controller is related to address validation 
 *                      and redirecting to next vendor listing page
 * @author:             Kiran Kumar Talapaku (kiran.talapaku@gmail.com) 
 * @copyright:          Fresh Carton LLC
 * @version:            1.0.1
 */
freshMarketApp.controller('paymentCtrl', function ($scope, $state, $rootScope, $http, $location, $ionicPopup, $timeout, $ionicModal) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    openInitial();

    function openInitial() {
        var customerDetails = JSON.parse(localStorage.getItem('authCred'));
        var userId = customerDetails.userData.id;
        var userAuthToken = customerDetails.userData.authkey;
        $scope.data = {
            selectedTip: 0.00
        };
        var productDetails = JSON.parse(localStorage.getItem('cartedItems'));

        var vendorArr = [];
        var vendorIdArr = [];

        for (var k in productDetails.cartedItems) {
            var item = productDetails.cartedItems[k];
            var vendorId = item.vendorDtails.id;
            var arrIndex = vendorIdArr.indexOf(vendorId);
            if (arrIndex === (-1)) {
                vendorIdArr.push(item.vendorDtails.id);
                var itemObj = {
                    'id': item.vendorDtails.id,
                    "name": item.vendorDtails.name,
                    "vendorcontactid": item.vendorDtails.vendorcontactid,
                    "vendorcontactaddressbookid": item.vendorDtails.vendorcontactaddressbookid,
                    "Products": []
                };
                vendorArr.push(itemObj);
            }
        }
        for (var l in vendorArr) {
            var v = vendorArr[l];
            var vId = v.id;
            var productArr = [];
            for (var m in productDetails.cartedItems) {
                var item = productDetails.cartedItems[m];
                var vendorId = item.vendorDtails.id;
                if (vendorId === vId) {
                    var productObj = {
                        "id": item.id,
                        "name": item.name,
                        "category": item.category,
                        "subcategory": item.subcategory,
                        "type": item.type,
                        "model": item.model,
                        "cartquantity": item.quantity,
                        "Inventories": item.Inventories
                    };
                    productArr.push(productObj);
                }
            }
            vendorArr[l].Products = productArr;
        }


        var orderPlaceObj = {
            "customer": {
                "id": userId,
                "email": customerDetails.userEmail,
                "deliveryAddress": productDetails.deliveryAddress,
                "scheduledate": productDetails.deliveryDate,
                "scheduletime": productDetails.deliverySchedule
            },
            "items": vendorArr
        };
        productDetails.orderObj = orderPlaceObj;
        console.log(productDetails);

        var encodedOrderValue = btoa(JSON.stringify(orderPlaceObj));
        localStorage.setItem('cartedItems', JSON.stringify(productDetails));
        var api_url = baseUrl + "customer/" + userId + "/orders?token=" + userAuthToken;
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
                $scope.subTotal = result.subtotalamount.toFixed(2);
                $scope.deliveryFee = result.deliveryfee.toFixed(2);
                $scope.tax = result.tax.toFixed(2);
                $scope.totalamount = result.totalamount.toFixed(2);
                $scope.payableAmount = $scope.totalamount;
                result.payableAmount = $scope.totalamount;
                productDetails.paymentDetails = result;
                localStorage.setItem('cartedItems', JSON.stringify(productDetails));
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Hey user',
                    template: "We are unable to getting your information.Please login again and proceed further."
                });
                $timeout(function () {
                    alertPopup.close();
                    var authCred = {
                        logged: false
                    };
                    $rootScope.logged = false;
                    localStorage.setItem('authCred', JSON.stringify(authCred));
                    $state.go('address');
                }, 2000);
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

    $scope.addTips = function () {
        var cartedProducts = JSON.parse(localStorage.getItem('cartedItems'));
        var cartAmount = cartedProducts.paymentDetails.totalamount;
        $scope.deliveryAddress = {};
        $ionicModal.fromTemplateUrl('delivery-details/tips-popup.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            var tenPercent = ((cartAmount * 10) / 100).toFixed(2);
            var fifteenPercent = ((cartAmount * 15) / 100).toFixed(2);
            var twentyPercent = ((cartAmount * 20) / 100).toFixed(2);
            $scope.tipsData = {
                tenPercent: tenPercent,
                fifteenPercent: fifteenPercent,
                twentyPercent: twentyPercent,
                later: 0,
                others: null
            };
            $scope.customTip = 0;
            $scope.modal.show();
        });
    };

    $scope.tipsAdding = function (tips) {
        if (tips.selectedTip === null) {
            $scope.data = {
                selectedTip: parseFloat(tips.customTip)
            };
        } else {
            $scope.data = {
                selectedTip: parseFloat(tips.selectedTip)
            };
        }
        $scope.modal.hide();
        $scope.modal.remove();
        var productDetails = JSON.parse(localStorage.getItem('cartedItems'));
        var tipAmount = $scope.data.selectedTip;
        var totalAmount = productDetails.paymentDetails.totalamount;
        var payableAmount = totalAmount + tipAmount;
        productDetails.paymentDetails.payableAmount = payableAmount;
        $scope.payableAmount = payableAmount.toFixed(2);
        localStorage.setItem('cartedItems', JSON.stringify(productDetails));
    };
    /* close pop up */
    $scope.closeLogin = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    $scope.changeTime = function (deliverySchedule) {
        $scope.deliverySchedule = deliverySchedule;
    };
});