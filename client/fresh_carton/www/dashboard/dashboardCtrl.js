/*
 * Description:         This controller is related to dashboard 
 *                      and redirecting to next vendor listing page
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
freshMarketApp.controller('dashboardCtrl', function ($scope, $rootScope, $state, $http) {
    $rootScope.showSearch = false;
    $scope.loading = true;
    if ($rootScope.reload === undefined) {
        loadInitial();
    } else {
        location.reload();
    }

    function loadInitial() {
        var authCred = JSON.parse(localStorage.getItem('authCred'));
        var authToken = authCred.userData.authkey;
        var userId = authCred.userData.id;
        if (authCred.logged === true) {
            var url = baseUrl + 'customer/' + userId + '/orders?token=' + authToken;
            $http({
                method: 'GET',
                url: url
            }).then(function (response) {
                if (response.status === 200) {
                    $scope.orders = response.data.orders;
                    for (var i in $scope.orders) {
                        var order = $scope.orders[i];
                        //console.log(order);
                        (function () {
                            var deliveryDate = order.scheduleAt;
                            var endTime = new Date(deliveryDate);
                            var formattedDate = DateFormat.format.date(endTime, "yyyy-MM-dd");
                            $scope.orders[i].formattedDate = formattedDate;
                        })($scope.orders, i);
                    }
                    $scope.loading = false;
                }
            }, function (response) {
                
            });
        } else {
            $state.go('address');
        }
    }
});