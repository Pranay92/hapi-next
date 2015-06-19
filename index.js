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

			func.call({},request,reply,function(err) {
				
				if(err) {
					return cb(err);
				}

				cb();
			});

		}
	}),function(err,results) {
		
		if(err) {
			reply(boom.badData(err));
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
	});
};

Series.prototype.promise = function(request,reply) {

	if(!request) {
		throw new Error('Request can\'t be empty.');
		return;
	}

	if(!reply) {
		throw new Error('Reply can\'t be empty.');
		return;
	}

	var arr = this.arr,
			currCall;

	async.series(arr.map(function(func) {

		return function(cb) {

			currCall = func.call({},request,reply);

			if(!currCall || !currCall.then || (typeof currCall.then !== 'function') ) {
				return cb();
			}

			currCall.then(function(data) {
				if(data) {
					reply.data = data;	
				}
				cb();
			})
			.catch(function(e) {
				cb(e);
			});

		}
	}),function(err,results) {
		
		if(err) {
			reply(boom.badData(err));
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
		
	});

};

module.exports = Series;