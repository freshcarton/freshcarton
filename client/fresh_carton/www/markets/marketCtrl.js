/*
 * Description:         This controller is related to listing of vendors from selected area,
 *                      Selectng vendor(s) and proceed next 
 *                      and redirecting to next vendor listing page
 * @author:             Thanuja Bachala (bachalas@gmail.com) 
 * @copyright:          Fourcontacts (http://www.fourcontacts.com) & Freshcarton LLC (http://www.freshcarton.com)
 * @version:            2.0.0
 */
freshMarketApp.controller('marketCtrl', function ($scope,$rootScope, $http, $location, $ionicPopup, $timeout) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    $scope.dataAvailable = false;
    $scope.formattedAddress='';
    
    $scope.selectedValues = [];
    if (localStorage.getItem("selectedMarket") !== null) {
        $scope.selectedValues = JSON.parse(localStorage.getItem('selectedMarket'));
    }

    findVendors();

    function findVendors() {
        var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
        var street = savedAddress.street;
        var city = savedAddress.city;
        var state = savedAddress.state;
        var zip = savedAddress.zip;
        $http({
            method: 'GET',
            url: baseUrl + 'markets/?zipcode=' + zip
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    $scope.formattedAddress= result.requestedaddress.address;
                    var requestedaddress = result.requestedaddress.address.split(',');
                    var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
                    var z=requestedaddress[1].trim().split(" ");
                        savedAddress.city=requestedaddress[0];
                        savedAddress.state=z[0];
                    var address = JSON.stringify(savedAddress);
                        localStorage.setItem('userAddress', address);
                        $scope.markets = result.vendors;
                    //var _vl=$scope.markets.length;
                    // if (localStorage.getItem("selectedMarket") === null) {
                    //     while(_vl--){
                    //         $scope.markets[_vl].checked=false;
                    //     }
                    // }else{
                    //     while(_vl--){
                    //         $scope.markets[_vl].checked=false;
                    //         if($scope.selectedValues.id==$scope.markets[_vl].id){
                    //             $scope.markets[_vl].checked=true;
                    //             break;
                    //         }
                    //     }
                    // }    
                    
                    $scope.markets.checked = false;
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

        angular.forEach(markets, function(market, index) {
            if (position != index){
                market.checked = false;
            }
            else
            {
               if ($scope.selectedValues.length == 0) {
                    $scope.selectedValues.push(market);
                }
                else{
                    $scope.selectedValues.splice(0, (0 + 1));
                    $scope.selectedValues.push(market);
                }
               
            }
                
            }
        );
    };
});