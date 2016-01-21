
<img src="https://github.com/Pranay92/hapi-next/blob/master/hapi-next.png" />

Add modularity to your hapi route handlers.

[![Build Status](https://travis-ci.org/Pranay92/hapi-next.svg?branch=master)](https://travis-ci.org/Pranay92/hapi-next) [![npm](https://img.shields.io/npm/dt/hapi-next.svg)](https://www.npmjs.com/package/hapi-next)

Install via **npm**

npm install hapi-next


## Important !!

> **Series.promise** has been added back since version **0.4.0**. Also **Series.execute** function and its function signature has been changed. See below example for changes.

> **data** as a third argument has been removed since version **0.3.0**. Install version **0.2.6** and below if you still want to use it.

> **.continue** has been removed for version **0.2.7** and **0.3.1** onwards. This is because of conflict with hapi's inbuild **reply.continue()**. Use **reply.next()** for version **0.2.7** and **0.3.1** onwards.

## Deprecation Warning !!

> Calling **reply.next(err)** since **0.4.0** needs either an object or just an error message(string). See example for details


Module that allows to inject next() in your route handler

Consider the following route handler in hapi:

```
handler : function(request, reply) {
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


**hapi-next** can be used in the following way

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
function validate(request,reply) {
  reply.next();
}

function someFuncToGetData(request,reply) {
  db.persons.queryAsync(request.query,function(err,persons) {
    if(err) {
      return reply.next({message : err, status : 422});
    }
    reply.data = persons;
    reply.next();
  });
}

function processSomeData(request,reply) {
  var processed = [];
  reply.data.forEach(function(dataObj) {
    processed.push(dataObj.name);
  });
  reply.data = processed;
  reply.next();
}
```

### Methods

**reply.next(err,config)**  This tells hapi-next to continue executing the next function in the chain. If error is passed as a non-null value, this will break the execution chain and will send the error response back to client. Also the **config** object is optional. As of now, it only supports sending status, but I'm willing to support more configuration in the future. 

**reply.data** Object used to pass data between functions in the chain. (see function signature in the above example). This defaults to object {'success' : true}. 

#### What about reply() ?

You're free to call reply() anywhere in the function chain. This will just stop calling the next function in the chain and send the response directly to the client. hapi-next **DOES NOT** overrides the `reply()` method. 

### Change log

**0.4.0** Added back **series.promise** as a new method of passing values in between. This is useful when we don't necessarily need to use callbacks, instead simply return promise frome each function.

**0.3.0** Removed **data** as a third argument from the functions. Use **reply.data** instead for passing data between functions.

**0.2.1** Removed **Series.promise** and its related componenets


### TODO

1. Add `Series.parallel()` to make functions execute in parallel that are independent and can immediately send a response.

