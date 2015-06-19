var users = require('./user-dump'),
	Promise = require('bluebird')

module.exports = {
	promiseGet  : PromiseGet,
	promiseAdd : PromiseAdd,
	callbackGet : CallbackGet,
	callbackAdd : CallbackAdd
};


function PromiseGet(request,reply) {
	var defer = Promise.defer();

	setTimeout(function() {
		defer.resolve(users);
	},500);

	return defer.promise;
}

function PromiseAdd(request,reply) {

	var defer = Promise.defer();

	setTimeout(function() {
		users.push({name : request.payload.name,id : (users.length + 1)});
		defer.resolve();
	},500);

	return defer.promise;
}


function CallbackGet(request,reply,next) {
	
	setTimeout(function() {
		reply.data = users;
		next();
	},500);
}

function CallbackAdd(request,reply,next) {
	
	setTimeout(function() {
		users.push({name : request.payload.name,id : (users.length + 1)});
		next();
	},500);
}

 


