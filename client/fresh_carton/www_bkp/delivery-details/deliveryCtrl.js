/*
 * Description:         This controller is related to address validation
 *                      and redirecting to next vendor listing page
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com)
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
 angular.module('ngCordova.plugins.datePicker', [])
  .factory('$cordovaDatePicker', ['$window', '$q', function ($window, $q) {
    return {
      show: function(options) {
        var d = $q.defer();

        $window.datePicker.show(options, function (date) {
          d.resolve(date);
        });

        return d.promise;
      }
    }

  }]);
freshMarketApp.controller('deliveryCtrl', function ($scope, $rootScope, $http, $location, $ionicPopup, $timeout, $ionicModal, $ionicNavBarDelegate) {
    $scope.loading = true;
    $rootScope.showSearch = false;
    if($rootScope.showCart ==undefined || $rootScope.showCart != 2){
        $location.path('/address');
        $rootScope.showCart=0;
    }else{
                          $rootScope.showCart=0;
        openInitial();
    }


    function openInitial() {
        var endTime = new Date();
        endTime.setDate(endTime.getDate() + 1);
        var endDate = DateFormat.format.date(endTime, "yyyy-MM-dd");
        var avilableDateTime = {
            times: [
                {
                    viewTime : '08:00:00-09:00:00',
                    scheduleTime : '08:00:00'
                },
                {
                    viewTime : '09:00:00-10:00:00',
                    scheduleTime : '09:00:00'
                },
                {
                    viewTime : '10:00:00-11:00:00',
                    scheduleTime : '10:00:00'
                },
                {
                    viewTime : '11:00:00-12:00:00',
                    scheduleTime : '11:00:00'
                },
                {
                    viewTime : '12:00:00-13:00:00',
                    scheduleTime : '12:00:00'
                },
                {
                    viewTime : '13:00:00-14:00:00',
                    scheduleTime : '13:00:00'
                },
                {
                    viewTime : '14:00:00-15:00:00',
                    scheduleTime : '14:00:00'
                },
                {
                    viewTime : '15:00:00-16:00:00',
                    scheduleTime : '15:00:00'
                },
                {
                    viewTime : '16:00:00-17:00:00',
                    scheduleTime : '16:00:00'
                },
                {
                    viewTime : '17:00:00-18:00:00',
                    scheduleTime : '17:00:00'
                }]
        };
        $scope.deliverySchedule = '08:00:00';
        $scope.availableDate = endDate;
        $scope.avilableDateTime = avilableDateTime;
        var cartedProducts = JSON.parse(localStorage.getItem('cartedItems'));
        $rootScope.cartAmount = '$ ' + cartedProducts.cartAmount.toFixed(2);
        $rootScope.cartCount = cartedProducts.cartCount;

        var savedAddress = JSON.parse(localStorage.getItem('userAddress'));
        // savedAddress.addressType = 'Residential';
        // savedAddress.apt = null;
        // savedAddress.street = null;
        // savedAddress.zip = null;
        // savedAddress.phone = null;
        $scope.savedAddress = savedAddress;
        // $ionicPopup.alert({
        //     title: 'Oops!',
        //     template: savedAddress
        // });

        //saveAddressNew();
        $scope.loading = false;
    }

    $scope.openCalender = function () {
        openDatePicker();
    };

    function openDatePicker() {
        var endTime = new Date();
        endTime.setDate(endTime.getDate() + 1);
        var options = {
            date: endTime,
            mode: 'date', // or 'time'
            minDate: endTime,
            allowOldDates: false
        };
        window.datePicker.show(options, function (date) {
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
                var formattedDate = DateFormat.format.date(date, "yyyy-MM-dd");
                $scope.availableDate = formattedDate;
                document.getElementById("availableDateSpan").innerHTML = formattedDate;
            }
        });
    }



    /* close pop up */
    $scope.closeLogin = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    $scope.setDeliveryPref = function () {
        console.log("checking address");
                          if(checkAddress()){
        var cartedProducts = JSON.parse(localStorage.getItem('cartedItems'));
        cartedProducts.deliverySchedule = $scope.deliverySchedule;
        cartedProducts.deliveryDate = $scope.availableDate;
        cartedProducts.deliveryAddress = $scope.deliveryAddress;
        localStorage.setItem('cartedItems', JSON.stringify(cartedProducts));
        $rootScope.showCart=3;
        $location.path('app/payment-details');
                          }else{
                                $ionicModal.fromTemplateUrl('delivery-details/delivery-address-popup.html', {
                                                      scope: $scope
                                                      }).then(function (modal) {
                                                              $scope.modal = modal;
                                                              $scope.modal.show();
                                                              });

                          }
    };

    $scope.changeTime = function (deliverySchedule) {
        $scope.deliverySchedule = deliverySchedule;
    };

    $scope.deliveryAddressPopUp = function () {
        $ionicModal.fromTemplateUrl('delivery-details/delivery-address-popup.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

      function checkAddress(){
          var addressString = '';
          if ($scope.savedAddress.addressType !== null && $scope.savedAddress.addressType.length>1) {
            addressString += $scope.savedAddress.addressType + ',';
          }else{
                          return false;
          }
          if ($scope.savedAddress.street !== null && $scope.savedAddress.street.length>1) {
            addressString += $scope.savedAddress.street + ',';
          }else{
            return false;
          }
          if ($scope.savedAddress.city !== null && $scope.savedAddress.city.length>1) {
            addressString += $scope.savedAddress.city + ',';
          }else{
            return false;
          }
          if ($scope.savedAddress.state !== null && $scope.savedAddress.state.length>1) {
            addressString += $scope.savedAddress.state + ',';
          }else{
            return false;
          }
          if ($scope.savedAddress.zip !== null && $scope.savedAddress.zip.length>4) {
            addressString += $scope.savedAddress.zip;
          }else{
            return false;
          }

          $scope.deliveryAddress = addressString;
                          return true;

      }

    function saveAddressNew() {
        var addressString = '';
        if ($scope.savedAddress.addressType !== null) {
            addressString += $scope.savedAddress.addressType + ',';
        }
        if ($scope.savedAddress.apt !== null) {
            addressString += $scope.savedAddress.apt + ',';
        }
        if ($scope.savedAddress.street !== null) {
            addressString += $scope.savedAddress.street + ',';
        }
        if ($scope.savedAddress.city !== null) {
            addressString += $scope.savedAddress.city + ',';
        }
        if ($scope.savedAddress.state !== null) {
            addressString += $scope.savedAddress.state + ',';
        }
        if ($scope.savedAddress.zip !== null) {
            addressString += $scope.savedAddress.zip;
        }
        $scope.deliveryAddress = addressString;
        localStorage.setItem('userAddress',JSON.stringify($scope.savedAddress));
    }

  function setDeliveryAddress() {
      var addressString = '';
      if ($scope.savedAddress.addressType !== null) {
      addressString += $scope.savedAddress.addressType + ',';
      }
      if ($scope.savedAddress.apt !== null) {
      addressString += $scope.savedAddress.apt + ',';
      }
      if ($scope.savedAddress.street !== null) {
      addressString += $scope.savedAddress.street + ',';
      }
      if ($scope.savedAddress.city !== null) {
      addressString += $scope.savedAddress.city + ',';
      }
      if ($scope.savedAddress.state !== null) {
      addressString += $scope.savedAddress.state + ',';
      }
      if ($scope.savedAddress.zip !== null) {
      addressString += $scope.savedAddress.zip;
      }
      $scope.deliveryAddress = addressString;
                          console.log(addressString);
      return addressString;
  }

    $scope.saveAddressNew = function () {
        $scope.modal.hide();
        $scope.modal.remove();
        saveAddressNew();
    };

    $scope.addressbook = [
        {
            'city':'sunnyvale',
            'state':'ca',
            'formattedaddress':'655 S. Fair Oaks Ave, i311, sunnyvale, ca, 94086'
        },
        {
            'city':'sunnyvale',
            'state':'ca',
            'formattedaddress':'655 S. Fair Oaks Ave, i312, sunnyvale, ca, 94086'
        },
        {
            'city':'sunnyvale',
            'state':'ca',
            'formattedaddress':'655 S. Fair Oaks Ave, i313, sunnyvale, ca, 94086'
        }
    ]

    $scope.selectedValues = [];

    $scope.toogleCheckBox = function (addr) {
        var arrIndex = $scope.selectedValues.indexOf(addr);
        if (arrIndex === (-1)) {
            $scope.selectedValues.push(addr);
        } else {
            $scope.selectedValues.splice(arrIndex, (arrIndex + 1));
        }
    };


});
