var Series = require('../index'),
	should = require('should'),
	mockFunc = require('./functions'),
	request,
	reply,
	response;

describe('Series Test Suite', function() {
	
	beforeEach(function(done) {
		
		request = function() {

		};

		reply = function(data) {
			response = data;
		};

		done();

	});

	describe('series',function() {
		
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
			response.output.payload.message.should.equal('Thrown from the server!')
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

	});
});