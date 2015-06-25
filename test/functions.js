module.exports = {
	
	testSuiteOne : {
		one : SuiteOneFuncOne,
		two : SuiteOneFuncTwo
	},

	testSuiteTwo : {
		one : SuiteTwoFuncOne,
		two : SuiteTwoFuncTwo
	}

};


function SuiteOneFuncOne(request,reply) {
	reply.continue();
}


function SuiteOneFuncTwo(request,reply) {
	reply.data = 'Sent from test function';
	reply.continue();
}

function SuiteTwoFuncOne(request,reply) {
	reply.continue();
};

function SuiteTwoFuncTwo(request,reply) {
	reply.continue('Thrown from the server!');
};