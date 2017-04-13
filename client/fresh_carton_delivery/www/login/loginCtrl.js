/*
 * Description:     Authentication controller,On success setting authentication key from response
 *                  Redirecting to dashboard
 * @author:         Kiran Kumar Talapaku(kiran.talapaku@gmail.com)
 * @version:        1.0.0
 * @copyright:      This project is subject to copyright of Freshcarton LLC
 */
﻿app.controller('loginCtrl', function ($scope) {
    $scope.doLogin = function (user) {
        setTimeout(function(){ 
            $('#loginErrorMessage').text("");
            $('#emailErrorMessage').text("");
            $('#passwordErrorMessage').text("");
        }, 2000);
        if(user!==undefined){
            var email = user.username;
            var password = user.password;
            if (email === '') {
                $scope.isValid = false;
                $('#emailErrorMessage').text("Please enter your email address");
                return false;
            } else if (!IsEmail(email)) {
                $scope.isValid = false;
                $('#emailErrorMessage').text("Please enter valid email address");
                return false;
            }else if (password === undefined) {
                $scope.isValid = false;
                $('#emailErrorMessage').text("");
                $('#passwordErrorMessage').text("Please enter your password");
                return false;
            } else if (password === '') {
                $scope.isValid = false;
                $('#emailErrorMessage').text("");
                $('#passwordErrorMessage').text("Please enter your password");
                return false;
            } else {
                $scope.isValid = true;
            }
        }else{
            $scope.isValid = false;
            $('#loginErrorMessage').text("Please provide your credential");
            return false;
        }
        /** CHANGE ENDPOINT URL **/
        $.ajax({
            type: 'POST',
            url: 'http://52.201.247.83/api/login',
            crossDomain: true,
            data: $.param({
                'entity[username]': email,
                'entity[hashkey]': password
            }),
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {
                if(responseData.rc===0){
                    var authKey = responseData.data.authkey;
                    var employeeId = responseData.data.id;
                    localStorage.setItem("dAppAuthKey", authKey);
                    localStorage.setItem("employeeId", employeeId);
                    $('input[type=email]').val('');
                    $('input[type=password]').val('');
                    window.location = "#/app/orders";
                }else{
                    $('#loginErrorMessage').text("Provided credential was wrong.Try again");
                    $('input[type=text]').val('');
                    $('input[type=password]').val('');
                    setTimeout(function(){ $('#loginErrorMessage').text(""); }, 2000);
                }
            },
            error: function (responseData, textStatus, errorThrown) {
                console.log(responseData, textStatus, errorThrown);
            }
        });
    };
    
    function IsEmail(val) {
        var x = val;
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (filter.test(x))
            return true;
        else
            return false;
    }
});