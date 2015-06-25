var Promise = require('bluebird');

module.exports = {
  promiseValidate  : PromiseValidate,
  validate : Validate
};


function CallbackValidate(request,reply) {
  setTimeout(function() {
    reply.continue();
  },500);
}


