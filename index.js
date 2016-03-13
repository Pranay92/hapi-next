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
				previousData = currInvocation;
				cb();
				return;
			}

			currInvocation
			.then(function(data) {

				if(data) {
					reply.data = data;
					cb();
					return;
				};

				previousData = null;
				cb();

			})
			.catch(function(e) {
				cb(e);
			});

		}
	}),function(err,results) {

		if(err) {
			reply(self.error(err));
			return;	
		}

		reply.data = previousData || reply.data || defaultData;
		reply(reply.data);
		reply.data = {};
		previousData = null;

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
			finalized = false,
			reqErrObj;

	async.series(arr.map(function(func) {
		return function(cb) {
			
			reply.next = function(err) {
				
				if(finalized) {
					return;
				}

				if(err) {
					return cb(err);
				}

				cb();
			};

			reply.finalize = function(data) {
				reply.data = data;
				cb('__hapi__next__success');
				finalized = true;
			};

			func.call({},request,reply);

		}
	}),function(err,results) {

		if(err && err !== '__hapi__next__success') {
			reply(self.error(err));
			return;
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
		reply.data = {};

	});
};

Series.prototype.background = function(request,reply) {

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

	async.parallel(arr.map(function(func) {
		return function(cb) {
			
			reply.next = function(err) {};

			func.call({},request,reply);
			cb();

		}
	}),function(err,results) {

		reply.data = reply.data || defaultData;
		reply(reply.data);
		reply.data = {};

	});
};

Series.prototype.parallel = function(request,reply) {

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
			funcArray = [],
			currInvocation,
			reqErrObj;

	for(var i=0; i< arr.length; i++) {
		funcArray.push((function(currFunc,request,reply){
			return function(cb){

				currInvocation = currFunc.call({},request,reply);

				if(!currInvocation.then || !currInvocation.catch) {
					cb();
					return;
				}

				currInvocation.then(function(){
					cb();
				})
				.catch(function(err){
					cb(err);
				});

			}
		})(arr[i],request,reply));
	}

	async.parallel(funcArray,function(err,results) {

		if(err) {
			reply(self.error(err));
			return;	
		}

		reply.data = reply.data || defaultData;
		reply(reply.data);
		reply.data = {};
		previousData = null;

	});
};

Series.prototype.merge = function(base,derived) {
	
	derived = derived || {};

	if(typeof derived === 'string') {
		base.message = derived;
		return base;
	}

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

	if (err.isBoom) {
		return err;
	}

	var defaultErrObj = {
				status : 400,
				message : 'Invalid request'
			};

	err = this.merge(defaultErrObj,err);
	return boom.create(err.status,err.message);
};

module.exports = Series;