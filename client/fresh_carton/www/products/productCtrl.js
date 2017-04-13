/*
 * Description:         This controller is related to products of selected vendors and adding to cart
 * @author:             Kiran Kumar Talapaku (kiran.talapaku@gmail.com)
 * @copyright:          Fresh Carton LLC
 * @version:            1.0.1
 */
freshMarketApp.controller('productCtrl', function ($scope, $rootScope, $http, $ionicModal, $ionicPopup, $timeout,$ionicNavBarDelegate) {
    $scope.loading = true;
    $rootScope.showSearch = true;
    $scope.dataAvailable = false;
    initialize();
    function initialize() {
        $scope.vendors = JSON.parse(localStorage.getItem('selectedVendors'));
        $scope.cartedItems = JSON.parse(localStorage.getItem('cartedItems'));
        console.log($scope.vendors);
        for (var i in $scope.vendors) {
            (function (vendor, i) {
                var vendorId = vendor.id;
                var product_url = baseUrl + 'vendors/' + vendorId + '/products';
                $http({
                    method: 'GET',
                    crossDomain: true,
                    url: product_url
                }).then(function (response) {
                    var result = response.data;
                    var products = result.products;
                    var pl=products.length;
                    while(pl--){
                        if(products[pl].ProductImages===null || products[pl].ProductImages.length==0){
                            products[pl].image='img/organic-Food.jpg';
                        }else{
                            products[pl].image=baseUrl + 'product/images/'+products[pl].ProductImages[0].filename;
                        }
                    }
                    for (var j in products) {
                        var prodId = products[j].id;
                        var indexKey = $scope.cartedItems.cartedItemsId.indexOf(prodId);
                        if (indexKey === (-1)) {
                            products[j].quantity = 1;
                        } else {
                            products[j].quantity = $scope.cartedItems.cartedItems[indexKey].quantity;
                        }
                        products[j]['vendorDtails'] = {
                            'id': vendor.id,
                            "name": vendor.name,
                            "vendorcontactid": vendor.VendorContacts[0].id,
                            "vendorcontactaddressbookid": vendor.VendorContacts[0].VendorContactAddressBooks[0].id
                        };
                    }
                    $scope.vendors[i].products = products;
                    $scope.loading = false;
                    $scope.dataAvailable = true;
                    
                });
            })($scope.vendors[i], i);
        }
    }

    $scope.openProductDetails = function (product) {
        $ionicModal.fromTemplateUrl('products/product-details.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.product = product;
            $scope.modal.show();
        });
    };
    
    /* close pop up */
    $scope.closeLogin = function () {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    $scope.reducProductQuantity = function (product) {
        if (product.quantity <= 1) {
            product.quantity = 1;
        } else {
            product.quantity--;
        }
    };

    $scope.incProductQuantity = function (product) {
        product.quantity++;
    };

    $scope.addToCart = function (product) {
        var prodId = product.id;
        var arrIndex = $scope.cartedItems.cartedItemsId.indexOf(prodId);
        if (arrIndex !== (-1)) { /* not previously added */
            $scope.cartedItems.cartedItemsId.splice(arrIndex, 1);
            $scope.cartedItems.cartedItems.splice(arrIndex, 1);
            var alertPopup = $ionicPopup.alert({
                title: 'Fresh Carton',
                template: "Product is already added to your cart"
            });
            $timeout(function () {
                alertPopup.close();
            }, 10000);
        }
        if (product.quantity > 0) {
            $scope.cartedItems.cartedItemsId.push(prodId);
            $scope.cartedItems.cartedItems.push(product);
        }
        var cartAmount = 0;
        for (var i in $scope.cartedItems.cartedItems) {
            var prod = $scope.cartedItems.cartedItems[i];
            var quantity = prod.quantity;
            var pricePerUnit = prod.Inventories[0].unitprice;
            cartAmount = cartAmount + (parseFloat(pricePerUnit) * parseInt(quantity));
        }
        $scope.cartedItems.cartAmount = cartAmount;
        $scope.cartedItems.cartCount = $scope.cartedItems.cartedItemsId.length;

        $rootScope.cartAmount = '$ ' + cartAmount.toFixed(2);
        $rootScope.cartCount = $scope.cartedItems.cartCount;
        localStorage.setItem('cartedItems', JSON.stringify($scope.cartedItems));
    };
    
    $scope.addToCartFromPouUp = function (product) {
        var prodId = product.id;
        var arrIndex = $scope.cartedItems.cartedItemsId.indexOf(prodId);
        if (arrIndex !== (-1)) { /* not previously added */
            $scope.cartedItems.cartedItemsId.splice(arrIndex, 1);
            $scope.cartedItems.cartedItems.splice(arrIndex, 1);
            var alertPopup = $ionicPopup.alert({
                title: 'Fresh Carton',
                template: "Product is already added to your cart"
            });
            $timeout(function () {
                alertPopup.close();
            }, 10000);
        }
        if (product.quantity > 0) {
            $scope.cartedItems.cartedItemsId.push(prodId);
            $scope.cartedItems.cartedItems.push(product);
        }
        var cartAmount = 0;
        for (var i in $scope.cartedItems.cartedItems) {
            var prod = $scope.cartedItems.cartedItems[i];
            var quantity = prod.quantity;
            var pricePerUnit = prod.Inventories[0].unitprice;
            cartAmount = cartAmount + (parseFloat(pricePerUnit) * parseInt(quantity));
        }
        $scope.cartedItems.cartAmount = cartAmount;
        $scope.cartedItems.cartCount = $scope.cartedItems.cartedItemsId.length;

        $rootScope.cartAmount = '$ ' + cartAmount.toFixed(2);
        $rootScope.cartCount = $scope.cartedItems.cartCount;
        localStorage.setItem('cartedItems', JSON.stringify($scope.cartedItems));
        $scope.closeLogin();
    };
});