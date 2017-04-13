/*
 * Description:     Authentication controller,On success setting authentication key from response
 *                  Redirecting to dashboard
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 * @dependency:     $scope,$http
 */
app.controller('orderPickUpCtrl', function ($scope, $http, $ionicPopup) {
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
                if (orders.length > 0) {
                    $scope.acceptedOrders = [];
                    for (var i in orders) {
                        if ((parseInt(localStorage.getItem("employeeId")) === orders[i].EmployeeId) && (orders[i].status === 'assigned')) {
                            orders[i].scheduleDate = (function (dateFormat) {
                                return $.format.date(dateFormat, "D MMM, yyyy - hh:mm p");
                            })(orders[i].scheduleAt);
                            $scope.acceptedOrders.push(orders[i]);
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

app.controller('orderPickDetailsCtrl', function ($scope, $http, $stateParams) {
    var pickOrderId = $stateParams.pickOrderId;
    $scope.loading = true;
    $scope.pickOrderId = pickOrderId;
    var dAppAuthKey = localStorage.getItem("dAppAuthKey");
    $http({
        method: 'JSONP',
        url: 'http://52.201.247.83/api/orders/' + pickOrderId + '/status?callback=JSON_CALLBACK&token=' + dAppAuthKey
    }).then(function (response) {
        var result = response.data; /* base64 response */
        var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
        if (jsonResult.rc === 0) {
            var order = jsonResult.data;
            order.scheduleDate = (function (dateFormat) {
                return $.format.date(dateFormat, "D MMM, yyyy - hh:mm p");
            })(order.scheduleAt);
            $scope.order = order;
            $scope.dataAvailable = true;
            $scope.loading = false;
        } else {
            $scope.loading = false;
            localStorage.removeItem("dAppAuthKey");
            window.location = "#/login";
        }
    });
});