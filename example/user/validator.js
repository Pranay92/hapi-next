var Promise = require('bluebird');

module.exports = {
  validate : Validate
};


function Validate(request,reply) {
  setTimeout(function() {
    reply.continue();
  },500);
}


