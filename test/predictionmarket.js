var PredictionMarket = artifacts.require("./PredictionMarket.sol");

const assertInvalidOpCode = (err) => {
  assert.equal(err, "Error: Error: VM Exception while executing eth_call: invalid opcode");
}

// Found here https://gist.github.com/xavierlepretre/afab5a6ca65e0c52eaf902b50b807401
var getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

contract('PredictionMarket', function(accounts) {

    var instance;
    var owner = accounts[0];
    var gambler1 = accounts[1];
    var gambler2 = accounts[2];
    var gambler3 = accounts[3];
    var trustedSource = accounts[4];

    before("should get an instance of PredictionMarket", () => {

        return PredictionMarket.deployed().then(_instance => {
            instance = _instance;
        });
    });

    it("should not add a question if not owner", (done) => {
         
        instance.addQuestion.call("Sky is blue ?",
            { from: accounts[1], gas: 3000000 }).then(_success => {
            done(new Error("User tried to submit question without being owner"));
        }).catch(_err => {
            assertInvalidOpCode(_err.toString().split('\n')[0]);
            done();
        });
    });

    describe("Several gamblers bets and we correctly set the earning", () => {
    
        before("should be possible to add a question", () => {
            var blockNumber;

            return instance.addQuestion.call("Sky is blue ?").then((_qId) => {
                assert.equal(_qId.valueOf(), 0, "should be possible to add the 1st question - dry call")
                blockNumber = web3.eth.blockNumber + 1;
                return instance.addQuestion("Sky is blue ?", {from: owner}); 
            }).then((_txn) => {
                return getEventsPromise(instance.LogQuestionAdded(
                    {},
                    { fromBlock: blockNumber, toBlock: "latest" }));
            }).then((_events) => {
                var eventArgs = _events[0].args;
                assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
                assert.equal(eventArgs.name, "Sky is blue ?", "should be the question name");
                return instance.getQuestionsCount.call();
            }).then((count) => {
                assert.equal(count.valueOf(), 1, "should has add a question");
                return instance.getQuestion(0);
            }).then((values) => {
                assert.equal(values[0], 0, "should be the question name");
                assert.equal(values[1], "Sky is blue ?", "should be the question name");  
            });
        });

        const valueBetGbler1 = web3.toWei(2,"ether");
        const valueBetGbler2 = web3.toWei(1,"ether");
        const valueBetGbler3 = web3.toWei(7,"ether");
        const voteGbler1 = false;
        const voteGbler2 = false;
        const voteGbler3 = true;
        const beforeEthBalance1 = web3.eth.getBalance(gambler1);
        const beforeEthBalance2 = web3.eth.getBalance(gambler2);
        const beforeEthBalance3 = web3.eth.getBalance(gambler3);
        const gasPrice = 10;
        var blockNumber;

        it("should allow gambler1 to bet false on questionId 0", () => {

            return instance.betQuestionId(0, voteGbler1, 
                {from: gambler1, value: valueBetGbler1, gasPrice: gasPrice})
            .then((_txn) => {  
                blockNumber = web3.eth.blockNumber;
                const weiUsed = _txn.receipt.gasUsed * gasPrice;
                const afterEthBalance1 = web3.eth.getBalance(gambler1);
                assert.deepEqual(beforeEthBalance1.minus(valueBetGbler1).minus(weiUsed), afterEthBalance1, "Gambler balance should be equal minus fee + amountbet");
                return getEventsPromise(instance.LogQuestionBetted(
                    {},
                    {fromBlock: blockNumber, toBlock: "latest"}));
            }).then((_events) => {
                var eventArgs = _events[0].args;
                assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
                assert.equal(eventArgs.sender, gambler1, "should be the gambler addresss");
                assert.equal(eventArgs.amountBetted, valueBetGbler1, "should be the amount betted");
                assert.equal(eventArgs.answer, voteGbler1, "should be the question vote");     
            });
        });

        it("should allow gambler2 and 3 to bet on questionId 0", () => {

            return instance.betQuestionId(0, voteGbler2, 
                {from: gambler2, value: valueBetGbler2, gasPrice: gasPrice})
            .then((_txn) => {  
                blockNumber = web3.eth.blockNumber;
                const weiUsed = _txn.receipt.gasUsed * gasPrice;
                const afterEthBalance2 = web3.eth.getBalance(gambler2);
                assert.deepEqual(beforeEthBalance2.minus(valueBetGbler2).minus(weiUsed), afterEthBalance2, "Gambler2 balance should be equal minus fee + amountbet");
                return getEventsPromise(instance.LogQuestionBetted(
                    {},
                    {fromBlock: blockNumber, toBlock: "latest"}));
            }).then((_events) => {
                var eventArgs = _events[0].args;
                assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
                assert.equal(eventArgs.sender, gambler2, "should be the gambler addresss");
                assert.equal(eventArgs.amountBetted, valueBetGbler2, "should be the amount betted");
                assert.equal(eventArgs.answer, voteGbler2, "should be the question vote");
                return instance.betQuestionId(0, 1, {from: gambler3, value: valueBetGbler3, gasPrice: gasPrice});       
            }).then((_txn) => {  
                blockNumber = web3.eth.blockNumber;
                const weiUsed = _txn.receipt.gasUsed * gasPrice;
                const afterEthBalance3 = web3.eth.getBalance(gambler3);
                assert.deepEqual(beforeEthBalance3.minus(valueBetGbler3).minus(weiUsed), afterEthBalance3, "Gambler3 balance should be equal minus fee + amountbet");
                return getEventsPromise(instance.LogQuestionBetted(
                    {},
                    {fromBlock: blockNumber, toBlock: "latest"}));
            }).then((_events) => {
                var eventArgs = _events[0].args;
                assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
                assert.equal(eventArgs.sender, gambler3, "should be the gambler addresss");
                assert.equal(eventArgs.amountBetted, valueBetGbler3, "should be the amount betted");
                assert.equal(eventArgs.answer, voteGbler3, "should be the question vote");
            });
    
        });

        it("should allow a trustedSource to resolve a question", () => {

            var qAnswer = false;
            var qStatusExpectResolved = 2;
            return instance.addTrustedSource(trustedSource, {from: owner}).then((_txn) => {
                return instance.isTrustedSource.call(trustedSource);
            }).then((_isIndeed) => {
                assert.isTrue(_isIndeed, " should be trusted source");
                return instance.setQuestionAnswer(0, qAnswer, {from: trustedSource});
            }).then((_txn) => {
                return instance.getQuestion(0);
            }).then((values) => {
                assert.equal(values[0], 0, "should be the question name");
                assert.equal(values[1], "Sky is blue ?", "should be the question name");
                assert.equal(values[9].valueOf(), qAnswer, "should be false");
                assert.equal(values[2].valueOf(), qStatusExpectResolved, "should be resolved" );
                return instance.betQuestionId.call(0, voteGbler2, 
                {from: gambler2, value: valueBetGbler2, gasPrice: gasPrice});
            }).then((_success) => {
                return new Error("User can't bet if question is resolved");
            }).catch(_err => {
                assertInvalidOpCode(_err.toString().split('\n')[0]);
             });
        });

        it("should allow a people to request payout", () => {
        
          return instance.requestPayoutQid.call(0, {from: gambler1}).then((_success) => {
                blockNumber = web3.blockNumber +1;
                return instance.requestPayoutQid(0, {from: gambler1});
            }).then((_success) => {
                return getEventsPromise(instance.LogPayoutSent(
                    {},
                    {fromBlock: blockNumber, toBlock: "latest"}));
            }).then((_events) => {
                var eventArgs = _events[0].args;
                assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
                assert.equal(eventArgs.sender, gambler1, "should be the gambler addresss");
                assert.equal(eventArgs.amount, web3.toWei(6.67,"ether"), "should be the amount earned");
            });
        });


    });



});


