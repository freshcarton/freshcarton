/*
 * Description:     angular.module is a global place for creating, registering and retrieving Angular modules
 *                  'delivery-app' is the name of this angular module (also set in a <body> attribute in index.html)
 *                  the 2nd parameter is an array of 'requires'
 *                  app.controller can be found in every controller
 * @version:        1.0.0
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 */ 
var app = angular.module('delivery-app', ['ionic','ngCordova']);
app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('login', {
        cache: false,
        url: '/login',
        templateUrl: 'login/login.html',
        controller: 'loginCtrl'
    })
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'app/menu.html',
        controller: 'AppCtrl'
    })
    .state('app.orders', {
        url: '/orders',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'order/order.html',
                controller: 'ordersCtrl'
            }
        }
    })
    .state('app.orderDetails', {
        url: '/orderDetails',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'order/orderDetails.html',
                controller: 'orderDetailsCtrl'
            }
        }
    })
    .state('app.orderPickup', {
        url: '/orderPickup',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'order-to-pickup/order-pickup.html',
                controller: 'orderPickUpCtrl'
            }
        }
    })
    .state('app.orderPickDetails', {
        url: '/orderPickDetails/:pickOrderId',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'order-to-pickup/pick-up-details.html',
                controller: 'orderPickDetailsCtrl'
            }
        }
    })
    .state('app.pickUpDetails', {
        url: '/pickUpDetails/:pickUpId/vendor/:vendorId',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'pick-up-details/pick-up-details.html',
                controller: 'pickUpCtrl'
            }
        }
    })
    .state('app.shipping', {
        url: '/shipping',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'shipping/shipping.html',
                controller: 'shippingCtrl'
            }
        }
    })
    .state('app.shippingSign', {
        url: '/shippingSign/:shippingOrderId',
        cache: false,
        views: {
            'mainContent': {
                templateUrl: 'shipping/shipping-details.html',
                controller: 'shippingSignCtrl'
            }
        }
    })
    .state('app.exitapp', {
        url: '/exitapp',
        cache: false,
        views: {
            'mainContent': {
                controller: 'exitAppCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
