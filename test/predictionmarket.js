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
  var account0 = accounts[0];
  var account1 = accounts[1];
  var account2 = accounts[2];

  before("should get an instance of PredictionMarket", () => {
    return PredictionMarket.deployed()
    .then(_instance => {
      instance = _instance;
    });
  });

  it("should not add a question if not owner", (done) => {
     instance.addQuestion.call("Sky is blue ?",
        { from: accounts[1], gas: 3000000 })
    .then(_success => {
      done(new Error("User submitted a tx and created a remittance with zero value"));
    })
    .catch(_err => {
      assertInvalidOpCode(_err.toString().split('\n')[0]);
      done();
    });
  });


  it("should be possible to add a question", () => {
    var blockNumber;
    return instance.addQuestion.call("Sky is blue ?")
    .then((_qId) => {
      assert.equal(_qId.valueOf(), 0, "should be possible to add the 1st question - dry call")
      blockNumber = web3.eth.blockNumber + 1;
      return instance.addQuestion("Sky is blue ?", {from: account0}); 
    })
    .then((_txn) => {
      return getEventsPromise(instance.LogQuestionAdded(
            {},
            { fromBlock: blockNumber, toBlock: "latest" }));
    })
    .then((_events) => {
      var eventArgs = _events[0].args;
      assert.equal(eventArgs.id.valueOf(), 0, "should be the question id");
      assert.equal(eventArgs.name, "Sky is blue ?", "should be the question name");
      return instance.getQuestionsCount.call();
    })
    .then((count) => {
      assert.equal(count.valueOf(), 1, "should has add a question");
      return instance.getQuestion(0);
    })
    .then((values) => {
      assert.equal(values[0], 0, "should be the question name");
      assert.equal(values[1], "Sky is blue ?", "should be the question name");  
    });

  });

  it("should have a count of 1 question", () => {
    return instance.getQuestionsCount.call()
          .then((count) => {
            console.log(count.valueOf());
            assert.equal(count.valueOf(), 1, "should has add a question");
     })
  });




});


