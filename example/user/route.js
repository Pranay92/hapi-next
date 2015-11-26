var server = require('./app'),
	Series = require('hapi-next'),
	controller = require('./controller'),
	validator = require('./validator'),
	joi = require('joi');

server.route({
	path : '/users',
	method : 'GET',
	handler : function(request,reply){
		
		var funcArray = [
			validator.validate,
			controller.get
		];

		var series = new Series(funcArray);
		series.execute(request,reply);

	}
});


server.route({
	path : '/users',
	method : 'POST',
	config : {
		validate : {
			payload : {
				name : joi.string().required()
			}
		},
		handler : function(request,reply){
			
			var funcArray = [
				validator.validate,
				controller.add
			];

			var series = new Series(funcArray);
			series.execute(request,reply);

		}
	}
});