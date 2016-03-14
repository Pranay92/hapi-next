var Promise = require('bluebird');
var boom = require('boom');

module.exports = {
	
	/*
		Test suites for Execute chain
	*/
	'execute' : {

		'one' : [
			ExecuteOneFuncOne,
			ExecuteOneFuncTwo
		],

		'two' : [
			ExecuteTwoFuncOne,
			ExecuteTwoFuncTwo
		],

		'three' : [
			ExecuteThreeFuncOne,
			ExecuteThreeFuncTwo
		],

		'four' : [
			ExecuteFourFuncOne,
			ExecuteFourFuncTwo
		],

		'five' : [
			ExecuteFiveFuncOne,
			ExecuteFiveFuncTwo
		],

		'six' : [
			ExecuteSixFuncOne,
			ExecuteSixFuncTwo
		],

		'seven' : [
			ExecuteSevenFuncOne,
			ExecuteSevenFuncTwo
		]

	},

	/*
		Test suites for Promise chain
	*/

	'promise' : {

		'one' : [
			PromiseOneFuncOne,
			PromiseOneFuncTwo
		],

		'two' : [
			PromiseTwoFuncOne,
			PromiseTwoFuncTwo
		],

		'three' : [
			PromiseThreeFuncOne,
			PromiseThreeFuncTwo
		]

	},

	/*
		Test suites for Background chain
	*/

	'background' : {

		'one' : [
			BackgroundOneFuncOne,
			BackgroundOneFuncTwo
		],

		'two' : [
			BackgroundTwoFuncOne,
			BackgroundTwoFuncTwo
		]

	},

	/*
		Test suites for parallel chain
	*/

	'parallel' : {

		'one' : [
			ParallelOneFuncOne,
			ParallelOneFuncTwo
		],

		'two' : [
			ParallelTwoFuncOne,
			ParallelTwoFuncTwo
		]

	}

};

// Execute function definitions from here

function ExecuteOneFuncOne(request,reply) {
	reply.next();
}


function ExecuteOneFuncTwo(request,reply) {
	reply.data = 'Sent from test function';
	reply.next();
}

function ExecuteTwoFuncOne(request,reply) {
	reply.next();
};

function ExecuteTwoFuncTwo(request,reply) {
	reply.next({message : 'Thrown from the server!', status : 422});
};

function ExecuteThreeFuncOne(request,reply) {
	reply.data = '11';
	reply.next();
};

function ExecuteThreeFuncTwo(request,reply) {
	reply.data += '22';
	reply.next();
};

function ExecuteFourFuncOne(request,reply) {
	reply.data = 'something';
	reply.next();
};

function ExecuteFourFuncTwo(request,reply) {
	reply.next({message : 'Unauthorized',status : 401});
};

function ExecuteFiveFuncOne(request,reply) {
	reply.next();
};

function ExecuteFiveFuncTwo(request,reply) {
	reply.next({message : 'Internal Server Error',status : 500});
};

function ExecuteSixFuncOne(request,reply) {
	reply.next();
}

function ExecuteSixFuncTwo(request,reply) {
	reply.next(boom.notFound('Unknown Product'));
};

function ExecuteSevenFuncOne(request,reply) {
	reply.data = 'this will be overriden';
	reply.finalize('this should be the final data');
	reply.next(); // calling this now wouldn't do anything
};

function ExecuteSevenFuncTwo(request,reply) {
	reply.data = 'added from function two';
	reply.next();
};

// Promise function definitions from here

function PromiseOneFuncOne(request,reply) {
	return new Promise(function(resolve,reject) {
		var data = 'Passed from function one';
		resolve(data);
	});
};

function PromiseOneFuncTwo(request,reply) {
	reply.data += ' and merged with function two';
	return new Promise(function(resolve,reject) {
		resolve(reply.data);
	});
};

function PromiseTwoFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		reject({message : 'Error from function one',status : 422});
	});
};

function PromiseTwoFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		resolve();
	});
};

function PromiseThreeFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		reject(boom.conflict('Error from function one'));
	});
};

function PromiseThreeFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		resolve();
	});
};

// Background function definitions from here

function BackgroundOneFuncOne(request,reply){
	reply.next();
};

function BackgroundOneFuncTwo(request,reply){
	setTimeout(function(){
		reply.data = {'msg' : 'Changed in the background functions'};
	},2000)
};

function BackgroundTwoFuncOne(request,reply){
	reply.next();
};

function BackgroundTwoFuncTwo(request,reply){
	reply.data = {'msg' : 'something new'};
	reply.next();
};

// Parallel function definitions start here

function ParallelOneFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			reply.data += ' new';
			resolve();
		},100);		
	});
};

function ParallelOneFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			reply.data = 'something';
			resolve();
		},10);		
	});
};

function ParallelTwoFuncOne(request,reply) {
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			reject(boom.conflict('Error from function one'));
		},100);		
	});
};

function ParallelTwoFuncTwo(request,reply) {
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve();
		},10);		
	});
};

