module.exports = {
	
	testSuiteOne : {
		one : SuiteOneFuncOne,
		two : SuiteOneFuncTwo
	},

	testSuiteTwo : {
		one : SuiteTwoFuncOne,
		two : SuiteTwoFuncTwo
	},

	testSuiteThree : {
		one : SuiteThreeFuncOne,
		two : SuiteThreeFuncTwo
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

function SuiteThreeFuncOne(request,reply) {
	reply.data = '11';
	reply.continue();
};

function SuiteThreeFuncTwo(request,reply) {
	reply.data += '22';
	reply.continue();
};