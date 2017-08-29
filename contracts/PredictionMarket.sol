pragma solidity ^0.4.2;

contract PredictionMarket is Owned {

	QuestionStruct[] public questionStructs;
 	enum BetStatus { Pending, Canceled, Resolved }
 	mapping (address => GamblerStruct) public gamblerStructs;
 	
	event LogQuestionAdded(uint id, string name);
	event LogQuestionAnswered(uint id, string answer);
	event LogPayoutSent(uint id, address sender, uint amount);
	event LogQuestionBetted(uint id, address sender, uint amountBetted, bool answer);
	event LogQuestionResolved(uint id, bool anwser);

	struct QuestionStruct {
		string question;
		uint betAmount;
		uint betCount;
		uint betAmountYes;
		uint betCountYes;
		uint betAmountNo;
		uint betCountNo;
		uint reward;
		bool answer;
		BetStatus betStatus;
		//Gambler address and bet amount
	    mapping(address => uint) voteYes;
	    mapping(address => uint) voteNo;
		uint listPointer;
	}
	
    struct GamblerStruct {
        uint balance;
       // uint[] questionGambled;
    }

	function addQuestion(string _question)
	    onlyOwner
		public
		returns (uint _questionId)
	{
        QuestionStruct memory question;
        question.question = _question;
        question.betAmount = 0;
        question.betStatus = BetStatus.Pending;
        uint questionId = questionStructs.push(question) - 1;
        questionStructs[questionId].listPointer = questionId;
        LogQuestionAdded(questionId, _question);
        return questionId;
	}

	function betQuestionId(uint id, bool _vote)
		payable
		public
		returns (bool success)
	{
	    require(msg.value>0);
	    require(isQuestion(id));
	    require(questionStructs[id].betStatus == BetStatus.Pending);
	    //Can't vote twice on the same question
	    require(questionStructs[id].voteYes[msg.sender]==0 &&  questionStructs[id].voteNo[msg.sender]==0);
	   
	    questionStructs[id].betAmount += msg.value;
	    questionStructs[id].betCount += 1;
	    
	    if (_vote) {
	        questionStructs[id].betCountYes += 1;
	        questionStructs[id].betAmountYes += msg.value;
	        questionStructs[id].voteYes[msg.sender] = msg.value;
	    } else {
	        questionStructs[id].betCountNo += 1;
	        questionStructs[id].betAmountNo += msg.value;
	        questionStructs[id].voteNo[msg.sender] = msg.value;
	    }
	    
	    LogQuestionBetted(id, msg.sender, msg.value, _vote);
	    return true;
	}
	
	function setQuestionAnswer(uint id, bool _answer)
	    public
	    onlyOwner
	    returns(bool success)
	{
	    require(isQuestion(id));
	    questionStructs[id].answer = _answer;
	    questionStructs[id].betStatus = BetStatus.Resolved;
	    LogQuestionResolved(id, _answer);
	    return true;
	    
	}
	
	function requestPayoutQid(uint id) 
	    public
	    returns(bool success)
	{
		require(isQuestion(id));
		require(questionStructs[id].betStatus == BetStatus.Resolved);
	    require(questionStructs[id].voteYes[msg.sender] != 0x0 || questionStructs[id].voteNo[msg.sender] != 0x0);

	    if(!updateGamblerBalance(msg.sender, id)) revert();
	    
	    uint amount = gamblerStructs[msg.sender].balance;
	    gamblerStructs[msg.sender].balance = 0 ;
	    msg.sender.transfer(amount);
	    LogPayoutSent(id, msg.sender, amount);
	    return true;
	}
	
	function updateGamblerBalance(address gambler, uint qId)
	    private
	    returns(bool success)
	{
	    bool qAnswer = questionStructs[qId].answer;
	    uint reward;
	    uint ratio;

	    if (qAnswer && questionStructs[qId].voteYes[gambler] != 0x0) 
	    {
	        uint valueBetY = questionStructs[qId].voteYes[gambler];
	        uint ttlValueBetY = questionStructs[qId].betAmountYes;
	        
	        ratio = percent(valueBetY, ttlValueBetY, 3);
	        reward = ratio * questionStructs[qId].betAmount;
	        reward = reward / 1000;
	        
	        gamblerStructs[gambler].balance += reward;
	        
	        questionStructs[qId].voteYes[gambler] = 0;
	        return true;
	    } else if (!qAnswer && (questionStructs[qId].voteNo[gambler] != 0x0)) 
	    {
	        uint valueBetN = questionStructs[qId].voteNo[gambler];
	        uint ttlValueBetN = questionStructs[qId].betAmountNo;
	       
	        ratio = percent(valueBetN, ttlValueBetN, 3);
	        reward = ratio * questionStructs[qId].betAmount;
	        reward = reward / 1000;
	   
	        gamblerStructs[gambler].balance += reward;
	        
	        // set vote AmountBetted to 0, so he cannot withdraw again
	        questionStructs[qId].voteNo[gambler] = 0;
	        return true;
	    }
	    
    	 return false;   
	}
	

    function percent(uint numerator, uint denominator, uint precision) public 

            constant returns(uint quotient) {

         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }
	

	function getQuestion(uint id)
		constant
		public
		returns (string name, uint betAmount)
	{
		QuestionStruct question = questionStructs[id];
		return (question.question, question.betAmount);
	}
	
    function getQuestionsCount()
        public
        constant
        returns(uint count)
    {
        return questionStructs.length;
    }
    
    function isQuestion(uint id) 
        public 
        constant 
        returns(bool isIndeed)
    {
        if(questionStructs.length == 0) return false;
        return (questionStructs[id].listPointer == id);
    }




}