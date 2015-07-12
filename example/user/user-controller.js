var users = require('./user-dump'),
	Promise = require('bluebird')

module.exports = {
	get : Get,
	add : Add
};


function Get(request,reply) {
	
	setTimeout(function() {
		reply.data = users;
		reply.continue();
	},500);
}

function Add(request,reply) {
	
	setTimeout(function() {
		users.push({name : request.payload.name,id : (users.length + 1)});
		reply.continue();
	},500);
}

 


