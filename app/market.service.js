var truffleContract = require("truffle-contract");
var marketJson = require("../build/contracts/PredictionMarket.json");
var Market = truffleContract(marketJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    Market.setProvider(web3.currentProvider);
    function mapQuestions(array) {
        return {
            name: array[0],
            amount: web3.fromWei(array[1].toNumber(), 'ether')
        }
    };

    return {
        getContract:function(){return Market;},
        getQuestions:function(instance){
            return instance.getQuestionsCount().then(count => {
                count = count.toNumber();
                var getQuestionPromises = [];
                for (var i = 0; i < count; i++) {
                    getQuestionPromises.push(instance.getQuestion(i));
                }
                return Promise.all(getQuestionPromises);
            }).then((questions)=>{
                return Promise.resolve(questions.map(mapQuestions));
            })
        },
        getQuestion:function(instance,index){
            return instance.getQuestion(index).then((array) => {
                return Promise.resolve(mapQuestions(array));
            })
        },
        getOwner:function(instance){
            return instance.owner().then((_owner) => {
                return _owner;
            })
        }
    };
}];    