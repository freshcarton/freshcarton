// angular.module('freshMarket.services', [])
// .factory('$paymentservice', function() {
//   return {
//     getToken: function() {
//       return 'sandbox_dpkzjg9m_2t62rpghphf9nmjv';
//     }
//   };
// });
 

angular.module('freshMarket.services', [])
.factory('$paymentservice', function() {
  return {
    getToken: function() {
      return '<%= clientToken %>';
    }
  };
});
