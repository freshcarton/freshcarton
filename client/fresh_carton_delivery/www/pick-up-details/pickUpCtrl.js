/*
 * Description:     Authentication controller,On success setting authentication key from response
 *                  Redirecting to dashboard
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 */
app.controller('pickUpCtrl', function ($scope, $stateParams, $http, $ionicModal) {
    var pickUpOrderId = $stateParams.pickUpId;
    $scope.orderId = pickUpOrderId;
    $scope.loading = false;
    var dAppAuthKey = localStorage.getItem("dAppAuthKey");
    var vendorId = $stateParams.vendorId;

    $scope.addVendorSign = true;
    $scope.addEmployeeSign = true;
    $http({
        method: 'JSONP',
        url: 'http://52.201.247.83/api/orders/' + pickUpOrderId + '/status?callback=JSON_CALLBACK&token=' + dAppAuthKey
    }).then(function (response) {
        var result = response.data; /* base64 response */
        var jsonResult = JSON.parse(atob(result)); /* base64 decoding and parsing JSON*/
        if (jsonResult.rc === 0) {
            var order = jsonResult.data;
            for (var i in order.OrderVendors) {
                if (order.OrderVendors[i].VendorId === parseInt(vendorId)) {
                    var orderStatus = order.OrderVendors[i].OrderSignatures[0].status;
                    if (orderStatus === 'picked') {
                        $scope.take_signature = false;
                    } else if (orderStatus === 'delivered') {
                        $scope.take_signature = false;
                    } else {
                        $scope.take_signature = true;
                    }
                    $scope.orderDetails = order.OrderVendors[i];
                }
            }
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
            $scope.modalHeading = "Vendor's Signature";
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
        var vendorSign = encodeURIComponent($scope.vendorSign);
        var employeeSign = encodeURIComponent($scope.employeeSign);
        if (vendorSign === 'undefined') {
            $("#vendorSignError").text(" Add vendor's signature");
            return false;
        } else if (employeeSign === 'undefined') {
            $("#employeeSignError").text(" Add employee's signature");
            return false;
        }
        $.ajax({
            type: 'POST',
            url: 'http://52.201.247.83/api/orders/' + pickUpOrderId + '/sign/' + vendorId + '/pickup',
            crossDomain: true,
            data: $.param({
                'entity[token]': dAppAuthKey,
                'entity[empsign]': employeeSign,
                'entity[vendorsign]': vendorSign
            }),
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {
				
                if (responseData.rc === 0) {
                    window.location = "#/app/orderPickDetails/" + pickUpOrderId;
                }
            },
            error: function (responseData, textStatus, errorThrown) {
                console.log(responseData, textStatus, errorThrown);
            }
        });
    };
});