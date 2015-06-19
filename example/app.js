var hapi = require('hapi'),
	Series = require('hapi-next'),
	controller = require('./user/user-controller'),
	validator = require('./user/user-validator'),
	joi = require('joi');


// Create a server with a host, port, and options
var server = module.exports = new hapi.Server();

server.connection({'port' : 3000});


server.route({
	path : '/promise/users',
	method : 'GET',
	handler : function(request,reply){
		
		var funcArray = [
			validator.promiseValidate,
			controller.promiseGet
		];

		var series = new Series(funcArray);
		series.promise(request,reply);

	}
});

server.route({
	path : '/callback/users',
	method : 'GET',
	handler : function(request,reply){
		
		var funcArray = [
			validator.callbackValidate,
			controller.callbackGet
		];

		var series = new Series(funcArray);
		series.execute(request,reply);

	}
});

server.route({
	path : '/promise/users',
	method : 'POST',
	config : {
		validate : {
			payload : {
				name : joi.string().required()
			}
		},
		handler : function(request,reply){
			
			var funcArray = [
				validator.promiseValidate,
				controller.promiseAdd
			];

			var series = new Series(funcArray);
			series.promise(request,reply);

		}
	}

});

server.route({
	path : '/callback/users',
	method : 'POST',
	config : {
		validate : {
			payload : {
				name : joi.string().required()
			}
		},
		handler : function(request,reply){
			
			var funcArray = [
				validator.callbackValidate,
				controller.callbackAdd
			];

			var series = new Series(funcArray);
			series.execute(request,reply);

		}
	}
});


server.start(function() {
	console.log('Server listening on port 3000');
});