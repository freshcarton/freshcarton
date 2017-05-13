/*
 * Description:         This controller is related to listing of vendors from selected area,
 *                      Selectng vendor(s) and proceed next 
 *                      and redirecting to next vendor listing page
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
freshMarketApp.controller('marketCtrl', function ($scope,$rootScope, $http, $location, $ionicPopup, $timeout) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    $scope.dataAvailable = false;
    findVendors();
    function findVendors() {
        var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
        var street = savedAddress.street;
        var city = savedAddress.city;
        var state = savedAddress.state;
        var zip = savedAddress.zip;
        $scope.formattedAddress = '';

        $http({
            method: 'GET',
            url: baseUrl + 'markets/?zipcode=' + zip
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    $scope.markets = result.vendors;
                    $scope.markets.checked = false;
                    $scope.formattedAddress = result.requestedaddress.address;
                    $scope.loading = false;
                    $scope.dataAvailable = true;
                } else {
                    $scope.dataAvailable = false;
                }
            } else {
                $scope.dataAvailable = false;
            }
        }, function (response) {
            $scope.dataAvailable = false;
        });
    }

    $scope.goToProducts = function () {
        if ($scope.selectedValues.length > 0) {
            localStorage.setItem('selectedMarket', JSON.stringify($scope.selectedValues));
            $location.path('app/vendors');
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Fresh Carton',
                template: "Select a market"
            });
            $timeout(function () {
                alertPopup.close();
            }, 3000);
        }
    };

    $scope.selectedValues = [];

    $scope.toogleCheckBox = function (position, markets) {

        angular.forEach(markets, function(subscription, index) {
            if (position != index){
                subscription.checked = false;
            }
            else
            {
               if ($scope.selectedValues.length == 0) {
                    $scope.selectedValues.push(subscription);
                }
                else{
                    $scope.selectedValues.splice(0, (0 + 1));
                    $scope.selectedValues.push(subscription);
                }
               
            }
                
            }
        );
    };
});