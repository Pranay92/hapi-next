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


function SuiteOneFuncOne(request,reply,data) {
	reply.continue();
}


function SuiteOneFuncTwo(request,reply,data) {
	reply.data = 'Sent from test function';
	reply.continue();
}

function SuiteTwoFuncOne(request,reply,data) {
	reply.continue();
};

function SuiteTwoFuncTwo(request,reply,data) {
	reply.continue('Thrown from the server!');
};

function SuiteThreeFuncOne(request,reply,data) {
	reply.data = '11';
	reply.continue();
};

function SuiteThreeFuncTwo(request,reply,data) {
	data += '22';
	reply.data = data;
	reply.continue();
};