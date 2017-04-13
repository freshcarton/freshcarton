/*
 * Description:     Controller for dashboard section
 *                  Loading available date intervals
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 * @dependency:     $scope,$http
 */
app.controller('ordersCtrl', function ($scope, $http, $ionicPopup) {

    loadInitial();

    function loadInitial() {
        var strtDate = new Date();
        var startDate = $.format.date(strtDate, "yyyy-MM-dd");
        var endTime = strtDate;
        endTime.setDate(endTime.getDate()+7);
        var endDate = $.format.date(endTime, "yyyy-MM-dd");;
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
            var availableOrders = [];
            if (jsonResult.rc === 0) {
                var firstDateIntervals = [];
                var secondDateIntervals = [];
                var orders = jsonResult.orders;
                if (orders.length>0) {
                    for (var i in orders) {
                        if (orders[i].status === 'new') {
                            availableOrders.push(orders[i]);
                            var orderDateTime = orders[i].scheduleAt;
                            var orderDate = orderDateTime.split('T')[0];
                            var d = new Date(orders[i].scheduleAt);
                            var currentDateTime = d.getTime();
                            var dFirstStart = new Date(orderDate + 'T09:00:00.0000Z');
                            var firstIntStart = dFirstStart.getTime();
                            var dFirstEnd = new Date(orderDate + 'T11:59:59.0000Z');
                            var firstIntEnd = dFirstEnd.getTime();
                            var dSecondStart = new Date(orderDate + 'T12:00:00.0000Z');
                            var secondIntStart = dSecondStart.getTime();
                            var dSecondEnd = new Date(orderDate + 'T15:00:00.0000Z');
                            var secondIntEnd = dSecondEnd.getTime();

                            if ((currentDateTime <= firstIntEnd)) {
                                firstDateIntervals.push(firstIntStart);
                            } else if ((firstIntEnd < currentDateTime)) {
                                secondDateIntervals.push(secondIntStart);
                            }
                            orders[i].scheduleStrDate = (function (dateFormat) {
                                return $.format.date(dateFormat, "D MMM, yyyy");
                            })(orders[i].scheduleAt);
                            orders[i].scheduleStrTime = (function (dateFormat) {
                                return $.format.date(dateFormat, "hh:mm p");
                            })(orders[i].scheduleAt);
                        }
                    }

                    var dateIntervals = [];
                    var firstDateIntervals = jQuery.unique(firstDateIntervals).sort();
                    var secondDateIntervals = jQuery.unique(secondDateIntervals).sort();
                    for (var j in firstDateIntervals) {
                        var intervalTimeStart = firstDateIntervals[j];
                        var orderDate = $.format.date(intervalTimeStart, "yyyy-MM-dd");
                        var dFirstEnd = new Date(orderDate + 'T11:59:59.0000Z');
                        var intervalTimeEnd = dFirstEnd.getTime();
                        var orderOfInterval = [];
                        for (var k in availableOrders) {
                            var d = new Date(availableOrders[k].scheduleAt);
                            var scheduleDateTime = d.getTime();
                            if ((scheduleDateTime <= intervalTimeEnd) && (scheduleDateTime >= intervalTimeStart)) {
                                orderOfInterval.push(availableOrders[k]);
                            }
                        }
                        dateIntervals.push({
                            dateIntervalStart: firstDateIntervals[j],
                            dareIntervalTime: "(9am to 12noon)",
                            dateIntervalName: (function (dateFormat) {
                                return $.format.date(dateFormat, "D MMM, yyyy ");
                            })(firstDateIntervals[j]), orderOfInterval: orderOfInterval});
                    }
                    for (var m in secondDateIntervals) {
                        var intervalTimeStart = secondDateIntervals[m];
                        var orderDate = $.format.date(intervalTimeStart, "yyyy-MM-dd");
                        var dFirstEnd = new Date(orderDate + 'T15:00:00.0000Z');
                        var intervalTimeEnd = dFirstEnd.getTime();
                        var orderOfInterval = [];
                        for (var n in availableOrders) {
                            var d = new Date(availableOrders[n].scheduleAt);
                            var scheduleDateTime = d.getTime();
                            if ((scheduleDateTime >= intervalTimeStart) && (scheduleDateTime <= intervalTimeEnd)) {
                                orderOfInterval.push(availableOrders[n]);
                            }
                        }
                        dateIntervals.push({
                            dateIntervalStart: secondDateIntervals[m],
                            dareIntervalTime: "(12noon to 3pm)",
                            dateIntervalName: (function (dateFormat) {
                                return $.format.date(dateFormat, "D MMM, yyyy ");
                            })(secondDateIntervals[m]), orderOfInterval: orderOfInterval});
                    }
                    $scope.dateIntervals = dateIntervals;
                    $scope.dataAvailable = true;
                }else{
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

    $scope.interValOrders = function (dateInterval) {
        localStorage.setItem("date_interval_orders", JSON.stringify(dateInterval));
        window.location = "#/app/orderDetails";
    };

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