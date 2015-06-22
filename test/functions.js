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


function SuiteOneFuncOne(request,reply,next) {
	next();
}


function SuiteOneFuncTwo(request,reply,next) {
	reply.data = 'Sent from test function';
	next();
}

function SuiteTwoFuncOne(request,reply,next) {
	next();
};

function SuiteTwoFuncTwo(request,reply,next) {
	next('Thrown from the server!');
};