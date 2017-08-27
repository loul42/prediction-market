


const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const PredictionMarketJson = require("../build/contracts/PredictionMarket.json");

if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });


const PredictionMarket = truffleContract(PredictionMarketJson);
PredictionMarket.setProvider(web3.currentProvider);

var app = angular.module('PredictionMarketApp', []);

app.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
});



app.run(['$rootScope', 'market', function ($rootScope, market) {
    web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length > 0) {
                $rootScope.account = accounts[0];
                $rootScope.$apply();
            }
        }).catch(console.error);

    market.getContract().deployed().then(_instance => {
        console.log("Contract at "+_instance.address);
        $rootScope.instance = _instance;
        $rootScope.$apply();
        var events = _instance.allEvents((error, log) => {
            if (!error)
                $rootScope.$broadcast(log.event,log.args);
            $rootScope.$apply();
        });
    });

}]);


app.service("market", require("./market.service.js"));
app.directive("questions", require("./questions/questions.js"));
app.directive("profil", require("./profil/profil.js"));
app.directive("admin", require("./admin/admin.js"));
