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
	reply.next();
}


function SuiteOneFuncTwo(request,reply) {
	reply.data = 'Sent from test function';
	reply.next();
}

function SuiteTwoFuncOne(request,reply) {
	reply.next();
};

function SuiteTwoFuncTwo(request,reply) {
	reply.next('Thrown from the server!');
};

function SuiteThreeFuncOne(request,reply) {
	reply.data = '11';
	reply.next();
};

function SuiteThreeFuncTwo(request,reply) {
	reply.data += '22';
	reply.next();
};