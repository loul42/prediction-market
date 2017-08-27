var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './questions/questions.html',
        link: function (scope, element, attrs) {

            var instance = scope.instance;

            var buyListener = $rootScope.$on("LogBuy", (event, args) => {
                market.getProduct(instance, args.index).then((product) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = product;
                    scope.$apply();
                });
            });

            var stockChangedListener = $rootScope.$on("LogStockChanged", (event, args) => {
                market.getProduct(instance, args.index).then((product) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = product;
                    scope.$apply();
                });
            });

            var addProductListener = $rootScope.$on("LogAddProduct", (event, args) => {
                reloadProducts();
            })

            function reloadProducts() {
                market.getProducts(instance).then(products => {
                    scope.products = products;
                    scope.$apply();
                })
            };

            reloadProducts();

            scope.buy = (product) => {
                var index = scope.products.indexOf(product);
                instance.buy.sendTransaction(index, { from: scope.account, value: product.price }).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    $rootScope.$apply();
                }).catch(err => console.error(err));
            }

            scope.$on("destroy", () => {
                buyListener();
                addProductListener();
                stockChangedListener();
            })
        }
    };
}];