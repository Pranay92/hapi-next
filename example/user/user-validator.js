var Promise = require('bluebird');

module.exports = {
  promiseValidate  : PromiseValidate,
  callbackValidate : CallbackValidate
};


function PromiseValidate(request,reply) {
  var defer = Promise.defer();

  setTimeout(function() {
    // add some validation logic here
    defer.resolve();
  },500);

  return defer.promise;
}

function CallbackValidate(request,reply,next) {
  setTimeout(function() {
    // add some valiation logic here
    next();
  },500);
}


