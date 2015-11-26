var hapi = require('hapi');

// Create a server with a host, port, and options
var server = module.exports = new hapi.Server();
server.connection({'port' : 3000});

// require routes once the server is 
require('./route');

server.start(function() {
	console.log('Server listening on port 3000');
});