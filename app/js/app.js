
require("file-loader?name=../index.html!../index.html");

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const PredictionMarketJson = require("../../build/contracts/PredictionMarket.json");

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


app.controller("PredictionMarketCtrl", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', 
  function ($scope, $location, $http, $q, $window, $timeout) {
  $scope.contributionLog = [];
  

  PredictionMarket.deployed()
  .then(function (_instance) {
    $scope.contract = _instance;
    console.log("The Contract:", $scope.contract);

    //don't want this to happen before the contract is known

    // $scope.betWatcher = $scope.contract.LogContribution({}, {fromBlock: 0})
    // .watch(function (err, newContribution) {
    //   if (err) {
    //     console.log("Error watching contribution events", err);
    //   } else {
    //     console.log("Contribution", newContribution);
    //     newContribution.args.amount = newContribution.args.amount.toString(10);
    //     $scope.contributionLog.push(newContribution);
    //     return $scope.getCampaignStatus();
    //   }
    // })

    return $scope.getPredictionMarketStatus();
  });

  $scope.getPredictionMarketStatus = function () {
    return $scope.contract.getQuestionCount({from: $scope.account})
    .then(function (_questionCount) {
      console.log("Number of questions", _questionCount.toString(10));
      $scope.questionsCount = _questionCount.toString(10);
      $scope.getQuestion();

      return $scope.contract.owner({ from: $scope.account });
    }) 
    .then(function (_owner) {
      console.log("owner", _owner);
      $scope.owner = _owner;
      $scope.isOwner = ($scope.account == _owner) ? true : false;
      console.log("is Owner : " + $scope.isOwner);

      return $scope.getCurrentblockNumber();
    });
  };


  $scope.getCurrentblockNumber = function () {
    web3.eth.getBlockNumber(function (err, bn) {
      if (err) {  
        console.log("error getting block number", err)
      } else {
         console.log("Current block number", bn);
         $scope.blockNumber = bn;
         $scope.$apply();
      } 

    })
  };


  web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      console.log ("There was an error fetching you accounts");
      return; 
    }
    
    if (accs.length == 0) {
      console.log ("There was zero account")
      return;
    }

    $scope.accounts = accs;
    $scope.account = $scope.accounts[0];
    console.log("using account", $scope.accounts);

    web3.eth.getBalance($scope.account, function (err, _balance) {
      $scope.balance = _balance.toString(10);
      $scope.balanceInEth = web3.fromWei ($scope.balance, "ether");
      $scope.$apply();
    })

  });


  // Questions Management
  // Add a question
  $scope.addQuestion = function(newId, newName) {
    $scope.contract.addQuestion(
        newId,
        newName,
        {from: $scope.account, gas: 300000})
      .then(function (tx) {
        console.log(tx);
        return web3.eth.getTransactionReceiptPromise(tx)
        .then(function (receipt) {
           console.log("Question added");
          return $scope.getPredictionMarketStatus();
        });
      });
  };

  $scope.getQuestion = function() {
      return $scope.contract.getQuestionCount({from: $scope.account})
      .then((count) => {
        var getQuestionPromises = [];
        for(var i=0; i<count.valueOf(); i++){
          getQuestionPromises.push($scope.contract.getQuestion(i));
        }
        console.log(Promise.all(getQuestionPromises));
        return Promise.all(getQuestionPromises);
      }).then((_questions) => {
        $scope.questions = _questions.map(mapQuestions);
        console.log(_questions.map(mapQuestions));
        $scope.$apply();
        return $scope.questions;
      })
  };

function mapQuestions(array) {
        return {
            name: array[0],
            amount: web3.fromWei(array[1].toNumber(), 'ether')
        }

    };

}]);
