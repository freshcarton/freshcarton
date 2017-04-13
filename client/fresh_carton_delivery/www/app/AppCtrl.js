/*
 * Description:     Abstract controller, using as constractor
 * @author:         Bidyabrata (bidyabrata1812@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Mastiska (http://mastiska.com) & AquaApi (http://www.aquaapi.com)
 */
﻿app.controller('AppCtrl', function ($scope,$ionicPlatform,$ionicHistory,$location,$ionicPopup) {    
    var authKey = localStorage.getItem("dAppAuthKey");
    if(authKey===null){
        window.location="#/login";
    }
    $scope.logOut = function () {
    var confirmPopup = $ionicPopup.confirm({
        title: 'Hello',
        template: 'Are you really want to log out?'
    });
    confirmPopup.then(function (res) {
        if (res) {
            localStorage.removeItem("dAppAuthKey");
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            window.location = "#/login";
        }
    });
    };
    
  // Disable BACK button on home
//  $ionicPlatform.registerBackButtonAction(function(event) {
//    if (true) { // your check here
//      $ionicPopup.confirm({
//        title: 'System warning',
//        template: 'are you sure you want to exit?'
//      }).then(function(res) {
//        if (res) {
//          ionic.Platform.exitApp();
//        }
//      });
//    }
//  }, 100);

});