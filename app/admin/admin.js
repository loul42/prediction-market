var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './admin/admin.html',
        link: function (scope, element, attrs) {

          var instance = scope.instance;

          var owner = market.getOwner(instance);
  
          Promise.resolve(owner).then((_owner) => {
            if (_owner.toString() == scope.account.toString()){
              scope.isOwner = true;
            } else {
             scope.isOwner = false;
            }
          });
      
          scope.addQuestion = function(newName) {
              instance.addQuestion(
                  newName.toString(),
                  {from: scope.account, gas: 300000})
              .then(function (tx) {
               console.log(tx);
               return web3.eth.getTransactionReceiptPromise(tx)
              .then(function (receipt) {
                console.log("Question added");
                });
              });
          };
        }
    };
}];