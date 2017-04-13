/*
 * Description:         This file is app declaration file, and running the app
 *                      Configuration for added plugins 
 * @author:             Bidyabrata (bidyabrata.biswas@mastiska.com) 
 * @copyright:          Mastiska (http://www.mastiska.com) & aquaAPI LLC (http://www.aquaapi.com)
 * @version:            1.0.0
 */
var freshMarketApp = angular.module('freshMarket', ['ionic','freshMarket.services']);
var baseUrl = "http://api.freshcarton.com/store/api/";
freshMarketApp.run(function ($ionicPlatform,$rootScope, $location) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
            return StatusBar.hide();
        }
    });
                   
});
