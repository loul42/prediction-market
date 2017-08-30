var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './questions/questions.html',
        link: function (scope, element, attrs) {

            var instance = scope.instance;

            // var buyListener = $rootScope.$on("LogBuy", (event, args) => {
            //     market.getProduct(instance, args.index).then((product) => {
            //         if (scope.products)
            //             scope.products[args.index.toNumber()] = product;
            //         scope.$apply();
            //     });
            // });

            // var stockChangedListener = $rootScope.$on("LogStockChanged", (event, args) => {
            //     market.getProduct(instance, args.index).then((product) => {
            //         if (scope.products)
            //             scope.products[args.index.toNumber()] = product;
            //         scope.$apply();
            //     });
            // });


             var addQuestionListener = $rootScope.$on("LogQuestionAdded", (event, args) => {
                 reloadQuestions();
             });

            function reloadQuestions() {
                market.getQuestions(instance).then(questions => {
                    console.log(questions);
                    scope.questions = questions;
                    scope.$apply();
                })
            };

            reloadQuestions();

            scope.vote = (_vote, qId, amount ) => {
                console.log(_vote,qId.valueOf(),amount);
                if(amount > 0 && (_vote==0 || _vote==1)){
                    instance.betQuestionId.sendTransaction(qId, _vote, { from: scope.account, value: amount, {gas: 4500000}).then((txn) => {
                        console.log("txn bet passed" + txn);
                    });
                }

            }

            // scope.buy = (product) => {
            //     var index = scope.products.indexOf(product);
            //     instance.buy.sendTransaction(index, { from: scope.account, value: product.price }).then((hash) => {
            //         //notifications.addTransactionNotification(hash);
            //         $rootScope.$apply();
            //     }).catch(err => console.error(err));
            // }

        }
    };
}];