var Promise = require('bluebird');

module.exports = {
	
	/*
		Test suites for Execute chain
	*/
	testSuiteOne : {
		one : SuiteOneFuncOne,
		two : SuiteOneFuncTwo
	},

	testSuiteTwo : {
		one : SuiteTwoFuncOne,
		two : SuiteTwoFuncTwo
	},

	testSuiteThree : {
		one : SuiteThreeFuncOne,
		two : SuiteThreeFuncTwo
	},

	testSuiteFour : {
		one : SuiteFourFuncOne,
		two : SuiteFourFuncTwo,
	},

	testSuiteFive : {
		one : SuiteFiveFuncOne,
		two : SuiteFiveFuncTwo
	},

	/*
		Test suites for Promise chain
	*/

	testSuiteSix : {
		one : SuiteSixFuncOne,
		two : SuiteSixFuncTwo
	}


};


function SuiteOneFuncOne(request,reply) {
	reply.next();
}


function SuiteOneFuncTwo(request,reply) {
	reply.data = 'Sent from test function';
	reply.next();
}

function SuiteTwoFuncOne(request,reply) {
	reply.next();
};

function SuiteTwoFuncTwo(request,reply) {
	reply.next('Thrown from the server!',{ status : 422});
};

function SuiteThreeFuncOne(request,reply) {
	reply.data = '11';
	reply.next();
};

function SuiteThreeFuncTwo(request,reply) {
	reply.data += '22';
	reply.next();
};

function SuiteFourFuncOne(request,reply) {
	reply.data = 'something';
	reply.next();
};

function SuiteFourFuncTwo(request,reply) {
	reply.next('Unauthorized',{status : 401});
};

function SuiteFiveFuncOne(request,reply) {
	reply.next();
};

function SuiteFiveFuncTwo(request,reply) {
	reply.next('Internal Server Error',{status : 500});
};

function SuiteSixFuncOne(request,reply,data) {
	return new Promise(function(resolve,reject) {
		var data = 'Passed from function one';
		resolve(data);
	});
};

function SuiteSixFuncTwo(request,reply,data) {
	data += ' and merged with function two';
	return new Promise(function(resolve,reject) {
		resolve(data);
	});
};











