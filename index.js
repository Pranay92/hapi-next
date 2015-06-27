var async = require('async'),
	boom = require('boom'),
	defaultData = {'success' : true};

function Series(arr) {
	this.arr = arr;
	Validate(arr);
}

function Validate(arr) {
	var len = arr.length;
	while(len--) {
		if(typeof arr[len] !== 'function') {
			throw new Error('Arguments passed in hapi-next must be functions');
		}
	}
}

Series.prototype.execute = function(request,reply) {
	
	if(!request) {
		throw new Error('Request can\'t be empty.');
		return;
	}

	if(!reply) {
		throw new Error('Reply can\'t be empty.');
		return;
	}

	var arr = this.arr;

	async.series(arr.map(function(func) {
		return function(cb) {
			
			reply.continue = function(err) {
				
				if(err) {
					return cb(err);
				}

				cb();
				reply.data = {};
			};

			func.call({},request,reply,reply.data);

		}
	}),function(err,results) {
		
		if(err) {
			reply(boom.badData(err));
			return;
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
	});
};

module.exports = Series;