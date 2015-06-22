# hapi-next

Install via **npm**

`npm install hapi-next`

[![Build Status](https://travis-ci.org/Pranay92/hapi-next.svg?branch=master)](https://travis-ci.org/Pranay92/hapi-next)

Module that allows to inject next() in your route handler

Consider the following route handler in hapi:

```
handle : function(request, reply) {
    controller.someFunc();
}
```


and in the controller: 

```
someFunc : function(request,reply) {

    validator.validate(request) 
             .then(function(err,response){
             
                if(err) {
                  return reply({status : '422', error : err});
                }
                
                return controller.someFuncToGetData();
             })
             .then(function(response) {
                
                if(response.err) {
                  return reply({status : 422, 'error' : response.err });
                }
                
                var data = controller.processTheData(response);
                reply(data);
                
             })
             .catch(function(e) {
                reply({'status' : 422,'error' : e});
             });
}
```

We have the following problem in the above:

1. Violation of **SRP**.

2. Code gets complex over time. 

3. Changing of any function requires checking the whole handler function invocation again.

4. **No default** error/response sending mechanism. Each function has to explicitly send error/response.


# What we can do about it?

Frameworks like *Express.JS* have a beautiful feature called **next()** that allows user to invoke functions in any order and completely independent of each other. While this feature is a part of ExpressJS, this can also be implemented as a separate npm module using **hapi-next**


**hapi-next** can be used in two ways

1. As a series of independent functions using **callbacks**
2. As a series of independent functions using **promises**

# hapi-next using callbacks:

Require `hapi-next`
```
var Series = require('hapi-next');
```

and in the handler

```
handler : function(request,reply) {
    
    var funcArray = [
      validator.validate,
      controller.someFuncToGetData,
      controller.processSomeData
    ];
    
    var series = new Series(funcArray);
    series.execute(request,reply);
}

```

your functions:

```
function validate(request,reply,next) {
  // do some validtion here
  next(); // calling next passes control to the next function in the series
}

function someFuncToGetData(request,reply,next) {
  db.queryAsync(request.query,function(err,data) {
    
    if(err) {
      return next(err); // hapi-next handles error by default, this will break the execution chain and send error response 
    }
    
    reply.data = data; // hapi-next will look for 'data' in the reply object and send it once all the functions are executed
    next();
  });
}
```

# hapi-next using promises

your handler:

```
handler : function(request,reply) {
    
    var funcArray = [
      validator.validate,
      controller.someFuncToGetData,
      controller.processSomeData
    ];
    
    var series = new Series(funcArray);
    series.promise(request,reply);
}

```
your functions:

```
function validate(request,reply) {

  // do some validtion here
  var defer = Promise.defer(); // use any promise library like blue-bird
  
  //do some validation here 
  // do defer.resolve(data) inside any async operation
  
  return defer.promise;
}

function someFuncToGetData(request,reply) {

  var defer = Promise.defer();

  db.queryAsync(request.query,function(err,data) {
    
    if(err) {
      return defer.reject(err); 
    }
    
    defer.resolve(data);

  });
  
  return defer.promise;
}
```



