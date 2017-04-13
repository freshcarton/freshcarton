/*
 * Description:     Authentication controller,On success setting authentication key from response
 *                  Redirecting to dashboard
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 */
app.controller('shippingCtrl', function ($scope, $http, $ionicPopup) {
    loadInitial();

    function loadInitial() {
        var strtDate = new Date();
        var startDate = $.format.date(strtDate, "yyyy-MM-dd");
        var endTime = strtDate;
        endTime.setDate(endTime.getDate() + 7);
        var endDate = $.format.date(endTime, "yyyy-MM-dd");
        loadOrders(startDate, endDate);
        $scope.loading = true;
    }

    function loadOrders(startDate, endDate) {
        var dAppAuthKey = localStorage.getItem("dAppAuthKey");
        $http({
            method: 'JSONP',
            url: 'http://52.201.247.83/api/orders?callback=JSON_CALLBACK&token=' + dAppAuthKey + '&from=' + startDate + '&to=' + endDate
        }).then(function (response) {
            var result = response.data; /* base64 response */
            var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
            if (jsonResult.rc === 0) {
                var orders = jsonResult.orders;
                $scope.shippingOrders = [];
                if (orders.length > 0) {
                    $scope.acceptedOrders = [];
                    for (var i in orders) {
                        if ((parseInt(localStorage.getItem("employeeId")) === orders[i].EmployeeId) && (orders[i].status === 'pick up complete')) {
                            orders[i].scheduleDate = (function (dateFormat) {
                                return $.format.date(dateFormat, "D MMM, yyyy - hh:mm p");
                            })(orders[i].scheduleAt);
                            $scope.shippingOrders.push(orders[i]);
                        }
                    }
                    $scope.dataAvailable = true;
                } else {
                    $scope.dataAvailable = false;
                }
                $scope.loading = false;
            } else {
                $scope.loading = false;
                localStorage.removeItem("dAppAuthKey");
                window.location = "#/login";
            }
        });
    }

    $scope.openCalender = function () {
        openDatePicker();
    };

    function openDatePicker() {
        var options = {
            date: new Date(),
            mode: 'date', // or 'time'
            minDate: new Date(),
            allowOldDates: false
        };
        window.datePicker.show(options, onSuccess);
    }

    function onSuccess(date) {
        var currentDate = new Date();
        if (date < currentDate) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops!',
                template: 'Select a valid date'
            });
            alertPopup.then(function (res) {
                openDatePicker();
            });
        } else {
            var strtDate = new Date();
            var startDate = $.format.date(strtDate, "yyyy-MM-dd");
            var endDate = $.format.date(date, "yyyy-MM-dd");
            $scope.loading = true;
            loadOrders(startDate, endDate);
        }
    }
});

app.controller('shippingSignCtrl', function ($scope, $http, $stateParams, $ionicModal) {
    var shippingOrderId = $stateParams.shippingOrderId;
    $scope.loading = true;
    $scope.addVendorSign = true;
    $scope.addEmployeeSign = true;
    var dAppAuthKey = localStorage.getItem("dAppAuthKey");
    $http({
        method: 'JSONP',
        url: 'http://52.201.247.83/api/orders/' + shippingOrderId + '?callback=JSON_CALLBACK&token=' + dAppAuthKey
    }).then(function (response) {
        var result = response.data; /* base64 response */
        var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
        if (jsonResult.rc === 0) {
            var order = jsonResult.data;
            order.scheduleDate = (function (dateFormat) {
                return $.format.date(dateFormat, "D MMM, yyyy - hh:mm p");
            })(order.scheduleAt);
            $scope.take_signature = (function (order_status) {
                var take_sign = true;
                if (order_status === 'delivered') {
                    take_sign = false;
                }
                return take_sign;
            })(order.status);
            $scope.order = order;
            $scope.dataAvailable = true;
            $scope.loading = false;
        } else {
            $scope.loading = false;
            localStorage.removeItem("dAppAuthKey");
            window.location = "#/login";
        }
    });

    $scope.addVendorSignature = function () {
        $ionicModal.fromTemplateUrl('pick-up-details/seller-sign.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modalHeading = "Customer's Signature";
            $scope.modal.show();
            var canvas = document.getElementById('signature');
            var signaturePad = new SignaturePad(canvas, {
                minWidth: .5,
                maxWidth: 1
            });
            $scope.clearCanvas = function () {
                signaturePad.clear();
            };
            $scope.saveCanvas = function () {
                var sigImg = signaturePad.toDataURL("image/png");
                $scope.addVendorSign = false;
                $scope.vendorSign = sigImg;
                $scope.modal.hide();
                $scope.modal.remove();
            };
        });
    };

    $scope.addEmpSignature = function () {
        $ionicModal.fromTemplateUrl('pick-up-details/seller-sign.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modalHeading = "Employee's Signature";
            $scope.modal.show();
            var canvas = document.getElementById('signature');
            var signaturePad = new SignaturePad(canvas, {
                minWidth: .5,
                maxWidth: 1
            });
            $scope.clearCanvas = function () {
                signaturePad.clear();
            };
            $scope.saveCanvas = function () {
                var sigImg = signaturePad.toDataURL("image/png");
                $scope.addEmployeeSign = false;
                $scope.employeeSign = sigImg;
                $scope.modal.hide();
                $scope.modal.remove();
            };
        });
    };

    $scope.closeLogin = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    $scope.pickedUp = function () {
        var orderId = $scope.order.id;
        var cutomerId = $scope.order.CustomerId;
        var vendorSign = encodeURIComponent($scope.vendorSign);
        var employeeSign = encodeURIComponent($scope.employeeSign);
        if (vendorSign === 'undefined') {
            $("#vendorSignError").text(" Add customer's signature");
            return false;
        } else if (employeeSign === 'undefined') {
            $("#employeeSignError").text(" Add employee's signature");
            return false;
        }

        $.ajax({
            type: 'POST',
            url: 'http://52.201.247.83/api/orders/' + orderId + '/sign/' + cutomerId + '/delivery',
            crossDomain: true,
            data: $.param({
                'entity[token]': dAppAuthKey,
                'entity[empsign]': employeeSign,
                'entity[customersign]': vendorSign
            }),
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {
                if (responseData.rc === 0) {
                    window.location = "#/app/shipping";
                }
            }
        });
    };
});