var truffleContract = require("truffle-contract");
var marketJson = require("../build/contracts/PredictionMarket.json");
var Market = truffleContract(marketJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    Market.setProvider(web3.currentProvider);
    function mapQuestions(array) {
        return {
            id: array[0],
            name: array[1],
            qStatus: getQuestionStatus(array[2].valueOf()),
            totalBetAmount: web3.fromWei(array[3].valueOf(), 'ether'),
            totalBetCount: array[4].valueOf(),
            totalBetAmountYes: web3.fromWei(array[5].valueOf(), 'ether'),
            totalBetCountYes: array[6].valueOf(),
            totalBetAmountNo: web3.fromWei(array[7].valueOf(), 'ether'),
            totalBetCountNo: array[8].valueOf(),
            qAnswer: array[9]
        }
    };


    function getQuestionStatus(_enum) {

        if(_enum == 0) return "Pending";
        if(_enum == 1) return "Canceled";
        if(_enum == 2) return "Resolved";
    }


    return {
        getContract:function(){return Market;},
        getQuestions:function(instance){
            return instance.getQuestionsCount().then(count => {
                count = count.valueOf();
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