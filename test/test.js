var series = require('../index'),
	should = require('should');

describe('Series Test Suite', function() {

	describe('series',function() {
		
		it('should be defined',function(done) {
			series.should.not.equal(undefined);
			done();
		});

	});
});