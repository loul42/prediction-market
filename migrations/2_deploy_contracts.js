var Owned = artifacts.require("./Owned.sol");
var PredictionMarket = artifacts.require("./PredictionMarket.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.deploy(PredictionMarket);
};
