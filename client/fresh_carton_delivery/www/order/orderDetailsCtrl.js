/*
 * Description:     Controller for order details and accept to pick up pop up 
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 * @dependency:     $scope,$http,$ionicModal
 */
app.controller('orderDetailsCtrl', function ($scope, $http, $ionicModal) {
    $scope.loading = true;
    $scope.dataAvailable = false;
    loadDefault();
    function loadDefault() {
        var orders = JSON.parse(localStorage.getItem("date_interval_orders"));
        var employeeId = localStorage.getItem("employeeId");
        $scope.pageTitle = orders.dateIntervalName;
        var orderOfInterval = orders.orderOfInterval;
        for (var i in orderOfInterval) {
            var order = orderOfInterval[i];
            var orderEmployee = parseInt(order.EmployeeId);
            var order_status;
            var order_class;
            if (orderEmployee === 0) {
                order_status = 0;
                order_class = "available";
            } else if (orderEmployee === parseInt(employeeId)) {
                order_status = 1;
                order_class = "accepted";
            } else {
                order_status = 2;
                order_class = "not-available";
            }
            orderOfInterval[i].order_status = order_status;
            orderOfInterval[i].order_class = order_class;
        }
        $scope.ordersOfTheInterval = orderOfInterval;
        $scope.dataAvailable = true;
        $scope.loading = false;
    }

    $scope.vendorItems = function (vendors) {
        var orderId = vendors.id;
        var dAppAuthKey = localStorage.getItem("dAppAuthKey");
        $http({
            method: 'JSONP',
            url: 'http://52.201.247.83/api/orders/' + orderId + '?callback=JSON_CALLBACK&token=' + dAppAuthKey
        }).then(function (response) {
            var result = response.data; /* base64 response */
            var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
            $scope.orderVendors.order_vendors = jsonResult.data.OrderVendors;
            $scope.orderId= jsonResult.data.id;
        });
        $ionicModal.fromTemplateUrl('order/vendor-items.html', {
            scope: $scope,
            hardwareBackButtonClose: true,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.orderVendors = vendors;
            $scope.modalHeading = "Order Details";
            $scope.modal.show();
        });
    };

    $scope.$on('$stateChangeStart', function (event) {
        if ($scope.modal.isShown()) {
            event.preventDefault();
            $scope.modal.remove();
        }
    });

    $scope.acceptToPickUp = function (orderId) {
        $scope.loading = true;
        var dAppAuthKey = localStorage.getItem("dAppAuthKey");
        $http({
            method: 'JSONP',
            url: 'http://52.201.247.83/api/orders/' + orderId + '/requestpickup?callback=JSON_CALLBACK&token=' + dAppAuthKey
        }).then(function (response) {
            var result = response.data; /* base64 response */
            var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
            if (jsonResult.rc === 0) {
                var employeeId = localStorage.getItem("employeeId");
                var orders = JSON.parse(localStorage.getItem("date_interval_orders"));
                $scope.loading = true;
                $scope.dataAvailable = false;
                var ordersOfTheInterval = orders.orderOfInterval;
                for (var i in ordersOfTheInterval) {
                    var order = ordersOfTheInterval[i];
                    if (parseInt(order.id) === parseInt(orderId)) {
                        ordersOfTheInterval[i].EmployeeId = employeeId;
                    }
                }
                orders.orderOfInterval = ordersOfTheInterval;
                localStorage.setItem("date_interval_orders", JSON.stringify(orders));
                loadDefault();
            } else {
                $scope.loading = true;
                $scope.dataAvailable = false;
                loadDefault();
            }
            $scope.modal.hide();
            $scope.modal.remove();
        });
    };
    $scope.closeItemList = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };
});