/*
 * Description:         This file is a configuration file for app
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
freshMarketApp.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('address', {
            url: '/address',
            cache: false,
            templateUrl: 'address/address.html',
            controller: 'addressCtrl'
        })
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'app/menu.html',
            controller: 'appCtrl'
        })
        .state('app.vendors', {
            url: '/vendors',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'vendors/vendors.html',
                    controller: 'vendorCtrl'
                }
            }
        })
        .state('app.products', {
            url: '/products',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'products/products.html',
                    controller: 'productCtrl'
                }
            }
        })
        .state('app.cart', {
            url: '/cart',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'cart/cart.html',
                    controller: 'cartCtrl'
                }
            }
        })
        .state('app.delivery', {
            url: '/delivery',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'delivery-details/delivery-utl.html',
                    controller: 'deliveryCtrl'
                }
            }
        })
        .state('app.payment-details', {
            url: '/payment-details',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'payment-details/payment-details.html',
                    controller: 'paymentCtrl'
                }
            }
        })
        .state('app.pay-and-deliver', {
            url: '/pay-and-deliver',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'delivery-details/pay-and-deliver.html',
                    controller: 'payDeliverCtrl'
                }
            }
        })
        .state('app.orders', {
            url: '/orders',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'orders/orders.html',
                    controller: 'orderCtrl'
                }
            }
        })
        
        /* states after login use */
        /* dashboard: state dashboard is for listing orders which are placed */
        .state('app.dashboard', {
            url: '/dashboard',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'dashboard/dashboard.html',
                    controller: 'dashboardCtrl'
                }
            }
        })
        /* order: order details of any specific order*/
        .state('app.order', {
            url: '/order/:orderId',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'order-details/order.html',
                    controller: 'orderDetailsCtrl'
                }
            }
        });
    /* if none of the above states are matched, use this as the fallback */ 
    $urlRouterProvider.otherwise('/address');
});
