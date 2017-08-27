var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './profil/profil.html',
        link: function (scope, element, attrs) {

          var instance = scope.instance;

          //On listener reload status
          var addQuestionListener = $rootScope.$on("LogQuestionAdded", (event, args) => {
             scope.getPredictionMarketStatus();
             scope.updateBalance();
          });


          scope.getPredictionMarketStatus = function () {
            return instance.getQuestionCount({from: scope.account})
            .then(function (_questionCount) {
              console.log("Number of questions", _questionCount.toString(10));
              scope.questionsCount = _questionCount.toString(10);
              return instance.owner({ from: scope.account });
            })
            .then(function (_owner) {
              console.log("owner", _owner);
              scope.owner = _owner;
              $rootScope.isOwner = (scope.account == _owner) ? true : false;
              return scope.getCurrentblockNumber();
            });
          };


          scope.updateBalance = function() {
            web3.eth.getBalance(scope.account, function (err, _balance) {
              scope.balance = _balance.toString(10);
              scope.balanceInEth = web3.fromWei (scope.balance, "ether");
              scope.$apply();
            });
          };

          scope.getCurrentblockNumber = function () {
            web3.eth.getBlockNumber(function (err, bn) {
              if (err) {  
                console.log("error getting block number", err)
              } else {
                 console.log("Current block number", bn);
                 scope.blockNumber = bn;
                 scope.$apply();
              } 

            })
          };

          scope.getPredictionMarketStatus();
        }
    };
}];