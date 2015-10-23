var async = require('async'),
	boom = require('boom'),
	defaultData = {'success' : true},
	defaultErrObj;

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
			self = this,
			currInvocation,
			previousData,
			reqErrObj;

	async.series(arr.map(function(func) {

		return function(cb) {
			
			currInvocation = func.call({},request,reply,previousData);

			if(!currInvocation.then || !currInvocation.catch) {
				reply.data = currInvocation;
				cb();
				return;
			}

			currInvocation.then(function(data) {
				
				if(data) {
					previousData = data;
					cb();
					return;
				};

				previousData = null;
				cb();

			});

			currInvocation.catch(function(e) {
				cb(e);
			});

		}
	}),function(err,results) {

		if(err) {
			reply(self.error(err));
			return;
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
		reply.data = {};

	});

};

Series.prototype.execute = function(request,reply) {
	
	if(!request) {
		throw new Error('Request can\'t be empty.');
		return;
	}

	if(!reply) {
		throw new Error('Reply can\'t be empty.');
		return;
	}

	var arr = this.arr,
			self = this,
			reqErrObj;

	async.series(arr.map(function(func) {
		return function(cb) {
			
			reply.next = function(err,obj) {
				
				if(err) {
					reqErrObj = obj || {};
					reqErrObj.message = err;
					return cb(reqErrObj);
				}

				cb();
			};

			func.call({},request,reply);

		}
	}),function(err,results) {

		if(err) {
			reply(self.error(err));
			return;
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
		reply.data = {};

	});
};

Series.prototype.merge = function(base,derived) {
	
	derived = derived || {};

	for(var i in base) {
		if(derived[i]) {
			base[i] = derived[i];
		}
	}

	if(!base.status || base.status < 400) {
		base.status = 400;
	}

	return base;
};

Series.prototype.error = function(err) {

	var defaultErrObj = {
				status : 400,
				message : 'Invalid request'
			};

	err = this.merge(defaultErrObj,err);
	
	return boom.create(err.status,err.message);
};

module.exports = Series;