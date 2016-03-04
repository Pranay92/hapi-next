var Series = require('../index'),
	should = require('should'),
	mockFunc = require('./functions'),
	request,
	reply,
	response;

describe('Series Test Suite for Execute', function() {
	
	beforeEach(function(done) {
		
		request = function() {

		};

		reply = function(data) {
			response = data;
		};

		done();

	});

	
	it('should be defined',function(done) {
		Series.should.not.equal(undefined);
		done();
	});

	it('should execute all functions', function(done) {
		
		var funcArray = [
			mockFunc.testSuiteOne.one,
			mockFunc.testSuiteOne.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.not.equal(undefined);
		response.should.equal('Sent from test function');
		done();
	});

	it('should return error as a reply', function(done) {

		var funcArray = [
			mockFunc.testSuiteTwo.one,
			mockFunc.testSuiteTwo.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.not.equal(undefined);
		response.isBoom.should.equal(true);
		response.output.statusCode.should.equal(422);
		response.output.payload.message.should.equal('Thrown from the server!');
		done();

	});

	it('should throw error', function(done) {

		var funcArray = [
			mockFunc.testSuiteOne.one,
			mockFunc.nonExistentFunc
		];

		(function(){
			new Series(funcArray)
		}).should.throw();
		
		done();
	});

	it('should pass data in between functions', function(done) {

		var funcArray = [
			mockFunc.testSuiteThree.one,
			mockFunc.testSuiteThree.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.equal('1122');
		done();
	});

	it('should throw unauthorized status code', function(done) {

		var funcArray = [
			mockFunc.testSuiteFour.one,
			mockFunc.testSuiteFour.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.not.equal(undefined);
		response.isBoom.should.equal(true);
		response.output.statusCode.should.equal(401);
		response.output.payload.message.should.equal('Unauthorized');
		done();
	});

	it('should throw internal server error', function(done) {

		var funcArray = [
			mockFunc.testSuiteFive.one,
			mockFunc.testSuiteFive.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.not.equal(undefined);
		response.isBoom.should.equal(true);
		response.output.statusCode.should.equal(500);
		response.output.payload.message.should.equal('An internal server error occurred');
		done();
	});

	it('should throw boom error when passing a boom error', function(done) {

		var funcArray = [
			mockFunc.testSuiteTen.one,
			mockFunc.testSuiteTen.two
		];

		var series = new Series(funcArray);
		series.execute(request,reply);
		response.should.not.equal(undefined);
		response.isBoom.should.equal(true);
		response.output.statusCode.should.equal(404);
		response.output.payload.message.should.equal('Unknown Product');
		done();
	});


});


describe('Series Test Suite for Promise', function() {

	beforeEach(function(done) {
		
		response = null;

		request = function() {

		};

		reply = function(data) {
			response = data;
		};

		done();

	});

	it('should return data passed as third argument', function(done) {
		
		this.timeout(2000);

		var funcArray = [
			mockFunc.testSuiteSix.one,
			mockFunc.testSuiteSix.two
		];

		var series = new Series(funcArray);
		series.promise(request,reply);

		setTimeout(function() {
			response.should.equal('Passed from function one and merged with function two');
			done();
		},50)
	});

	it('should return error', function(done) {
		
		this.timeout(2000);

		var funcArray = [
			mockFunc.testSuiteSeven.one,
			mockFunc.testSuiteSeven.two
		];

		var series = new Series(funcArray);
		series.promise(request,reply);

		setTimeout(function() {
			response.should.not.equal(undefined);
			response.isBoom.should.equal(true);
			response.output.statusCode.should.equal(422);
			response.output.payload.message.should.equal('Error from function one');
			done();
		},50)
	});

	it('should return a boom error when passing a boom error', function(done) {

		this.timeout(2000);

		var funcArray = [
			mockFunc.testSuiteEleven.one,
			mockFunc.testSuiteEleven.two
		];

		var series = new Series(funcArray);
		series.promise(request,reply);

		setTimeout(function() {
			response.should.not.equal(undefined);
			response.isBoom.should.equal(true);
			response.output.statusCode.should.equal(409);
			response.output.payload.message.should.equal('Error from function one');
			done();
		},50)
	});

});

describe('Series Test Suite for Background Chain', function() {
	
	beforeEach(function(done) {
		
		response = null;

		request = function() {

		};

		reply = function(data) {
			response = data;
		};

		done();

	});

	it('should not change the reply object',function(done){

		var funcArray = [
			mockFunc.testSuiteEight.one,
			mockFunc.testSuiteEight.two
		];

		var series = new Series(funcArray);
		series.background(request,reply);

		response.should.not.equal(undefined);
		response.success.should.equal(true);
		done();

	});

	it('should change the reply object',function(done){

		var funcArray = [
			mockFunc.testSuiteNine.one,
			mockFunc.testSuiteNine.two
		];

		var series = new Series(funcArray);
		series.background(request,reply);

		response.should.not.equal(undefined);
		response.msg.should.equal('something new');
		done();

	});
});

describe('Series Test Suite for Parallel Chain', function() {
	
	beforeEach(function(done) {
		
		response = null;

		request = function() {

		};

		reply = function(data) {
			response = data;
		};

		done();

	});

	it('should exeute functions in parallel and update response',function(done){

		this.timeout(600);

		var funcArray = [
			mockFunc.testSuiteTwelve.one,
			mockFunc.testSuiteTwelve.two
		];

		var series = new Series(funcArray);
		series.parallel(request,reply);

		setTimeout(function(){
			response.should.not.equal(undefined);
			response.should.equal('something new');
			done();			
		},500)


	});

	it('should handle boom error if one of the functions fail',function(done){

		this.timeout(600);

		var funcArray = [
			mockFunc.testSuiteThirteen.one,
			mockFunc.testSuiteThirteen.two
		];

		var series = new Series(funcArray);
		series.parallel(request,reply);

		setTimeout(function(){
			response.should.not.equal(undefined);
			response.isBoom.should.equal(true);
			response.output.statusCode.should.equal(409);
			response.output.payload.message.should.equal('Error from function one');
			done();			
		},500)


	});


})







