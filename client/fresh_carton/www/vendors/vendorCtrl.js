/*
 * Description:         This controller is related to listing of vendors from selected area,
 *                      Selectng vendor(s) and proceed next 
 *                      and redirecting to next vendor listing page
 * @author:             Thanuja Bachala (bachalas@gmail.com) 
 * @copyright:          Fourcontacts (http://www.fourcontacts.com) & Freshcarton LLC (http://www.freshcarton.com)
 * @version:            2.0.0
 */
freshMarketApp.controller('vendorCtrl', function ($scope,$rootScope, $http, $location, $ionicPopup, $timeout) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    $scope.dataAvailable = false;
    $scope.selectedValues = [];
    
    if (localStorage.getItem("selectedVendors") !== null) {
        $scope.selectedValues = JSON.parse(localStorage.getItem('selectedVendors'));
    }    
    findVendors();
    function findVendors() {
        $scope.market = JSON.parse(localStorage.getItem('selectedMarket'));
        var marketId = $scope.market[0].id;
        $scope.marketname = $scope.market[0].name;
        var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
        var street = savedAddress.street;
        var city = savedAddress.city;
        var state = savedAddress.state;
        var zip = savedAddress.zip;
        $scope.formattedAddress = '';
        $http({
            method: 'GET',
            url: baseUrl + 'markets/' + marketId + '/vendors'
        }).then(function (response) {
            if (response.status === 200) {
                var result = response.data;
                if (result.rc === 0) {
                    $scope.vendors = result.vendors.MarketVendors;
                    //$scope.formattedAddress = result.requestedaddress.address;
                    $scope.loading = false;
                    $scope.dataAvailable = true;
                    var _vl=$scope.vendors.length;
                    if (localStorage.getItem("selectedVendors") === null) {
                        while(_vl--){
                            $scope.vendors[_vl].isselected=false;
                        }
                    }else{
                        var _sv=$scope.selectedValues.length;
                        console.log($scope.selectedValues);
                        while(_vl--){
                            $scope.vendors[_vl].isselected=false;
                            while(_sv--){
                                if($scope.selectedValues[_sv].id==$scope.vendors[_vl].id){
                                    $scope.vendors[_vl].isselected=true;
                                    break;
                                }
                            }
                        }
                    }    
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
            localStorage.setItem('selectedVendors', JSON.stringify($scope.selectedValues));
            $location.path('app/products');
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Fresh Carton',
                template: "Select a store to show products"
            });
            $timeout(function () {
                alertPopup.close();
            }, 3000);
        }
    };


    

    $scope.toogleCheckBox = function (vendor) {
        
       /* angular.forEach(vendors, function(subscription, index) {
            if (position != index){
                console.log("not checked "+index);
                subscription.checked = false;
            }
            else
            {
               console.log("checked "+index);
               if ($scope.selectedValues.length == 0) {
                    $scope.selectedValues.push(subscription);
                }
                else{
                    $scope.selectedValues.splice(0, (0 + 1));
                    $scope.selectedValues.push(subscription);
                }
               
            }
                
            }
        );*/

        
        var arrIndex = $scope.selectedValues.indexOf(vendor);
        if (arrIndex == -1) {
            vendor.isselected=true;
            $scope.selectedValues.push(vendor);
        } else {
            $scope.selectedValues.splice(arrIndex, (arrIndex + 1));
        }
    };

});