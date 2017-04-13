/*
 * Description:         This controller is related to dashboard 
 *                      and redirecting to next vendor listing page
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
freshMarketApp.controller('orderDetailsCtrl', function ($scope, $rootScope, $state, $http, $stateParams) {
    $rootScope.showSearch = false;
    $scope.loading = true;
    var orderId = $stateParams.orderId;
    var authCred = JSON.parse(localStorage.getItem('authCred'));
    var authToken = authCred.userData.authkey;
    var userId = authCred.userData.id;
    if (authCred.logged === true) {
        loadOrdersDetails(orderId);
    } else {
        $state.go('app.vendors');
    }

    function loadOrdersDetails(orderId) {
        var order_url = baseUrl + 'customer/' + userId + '/orders/' + orderId + '?token=' + authToken;
        $http({
            method: 'GET',
            url: order_url
        }).then(function (response) {
            var orderDetails = response.data;
          //  console.log(orderDetails);
            $scope.order = orderDetails.orders;
            var deliveryDate = $scope.order.scheduleAt;
            var endTime = new Date(deliveryDate);
            var formattedDate = DateFormat.format.date(endTime, "yyyy-MM-dd");
            $scope.order.formattedDate = formattedDate;
            $scope.loading = false;
        });
    }
});