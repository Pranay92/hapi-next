var Promise = require('bluebird');
var boom = require('boom');

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
	},

	testSuiteSeven : {
		one : SuiteSevenFuncOne,
		two : SuiteSevenFuncTwo
	},

	/*
		Test suites for Background chain
	*/

	testSuiteEight : {
		one : SuiteEightFuncOne,
		two : SuiteEightFuncTwo
	},

	testSuiteNine : {
		one : SuiteNineFuncOne,
		two : SuiteNineFuncTwo
	},

	testSuiteTen : {
		one : SuiteTenFuncOne,
		two : SuiteTenFuncTwo
	},

	testSuiteEleven : {
		one : SuiteElevenFuncOne,
		two : SuiteElevenFuncTwo
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
	reply.next({message : 'Thrown from the server!', status : 422});
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
	reply.next({message : 'Unauthorized',status : 401});
};

function SuiteFiveFuncOne(request,reply) {
	reply.next();
};

function SuiteFiveFuncTwo(request,reply) {
	reply.next({message : 'Internal Server Error',status : 500});
};

function SuiteSixFuncOne(request,reply) {
	return new Promise(function(resolve,reject) {
		var data = 'Passed from function one';
		resolve(data);
	});
};

function SuiteSixFuncTwo(request,reply) {
	reply.data += ' and merged with function two';
	return new Promise(function(resolve,reject) {
		resolve(reply.data);
	});
};

function SuiteSevenFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		reject({message : 'Error from function one',status : 422});
	});
};

function SuiteSevenFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		resolve();
	});
};


function SuiteEightFuncOne(request,reply){
	reply.next();
};

function SuiteEightFuncTwo(request,reply){
	setTimeout(function(){
		reply.data = {'msg' : 'Changed in the background functions'};
	},2000)
};

function SuiteNineFuncOne(request,reply){
	reply.next();
};

function SuiteNineFuncTwo(request,reply){
	reply.data = {'msg' : 'something new'};
	reply.next();
};

function SuiteTenFuncOne(request,reply) {
	reply.next();
}

function SuiteTenFuncTwo(request,reply) {
	reply.next(boom.notFound('Unknown Product'));
}

function SuiteElevenFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		reject(boom.conflict('Error from function one'));
	});
}

function SuiteElevenFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		resolve();
	});
}

