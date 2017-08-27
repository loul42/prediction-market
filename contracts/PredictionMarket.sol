pragma solidity ^0.4.2;

import "./Owned.sol";

contract PredictionMarket is Owned {

	mapping(uint => QuestionStruct) private questionsMap;
	uint[] private ids;

	event LogQuestionAdded(uint id, string name);
	event LogQuestionAnswered(uint id, string answer);

	struct QuestionStruct {
		string question;
		uint betAmount;
	}

	function addQuestion(uint id, string question)
		public
		onlyOwner
		returns (bool success)
	{
		//TODO : check four duplicate
		questionsMap[id] = QuestionStruct({
				question: question,
				betAmount: 0
		});
		ids.push(id);
		LogQuestionAdded(id, question);
		return true;
	
	}

	function getQuestionCount() 
		constant
		public 
		returns (uint length) {
		return ids.length;	
	}

	function getQuestionIdAt(uint index)
		constant
		public
		returns (uint id) {
		return ids[index];
	}

	function betQuestionIdAt(uint index)
		payable
		public
		returns (bool success)
	{
		// question.amounttot += msg.value
		//
	}

	function getQuestion(uint id)
		constant
		public
		returns (string name, uint betAmount)
	{
		QuestionStruct question = questionsMap[id];
		return (question.question, question.betAmount);
	}

}