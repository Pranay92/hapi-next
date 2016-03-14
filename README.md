
<img src="https://raw.githubusercontent.com/Pranay92/hapi-next/master/hapi-next.png" />

[![Build Status](https://travis-ci.org/Pranay92/hapi-next.svg?branch=master)](https://travis-ci.org/Pranay92/hapi-next) [![npm](https://img.shields.io/npm/dt/hapi-next.svg)](https://www.npmjs.com/package/hapi-next)

Add modularity to your hapi route handlers.

Install via **npm**

````npm install hapi-next````


## Important! 

Please read the [change log](https://github.com/Pranay92/hapi-next/wiki/Change-log) for changes between the version. Using the latest version is recommended always.

## Description

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

**reply.next(err,config)**  This tells hapi-next to continue executing the next function in the chain. If error is passed as a non-null value, this will break the execution chain and will send the error response back to client. Also the **config** object is optional. Upto version 0.4.0 it only supported sending status, as of **0.5.0** it also supports sending **boom** error object.

**reply.data** Object used to pass data between functions in the chain. (see function signature in the above example). This defaults to object ````{success : true}````. 

**reply.finalize(data)** Method to break the series chain and send the response direclty. Available ONLY on ````series.execute```` and since version **0.7.0** onwards.

### Series chains

**series.execute(request,reply)**  Executes all the functions in sequence and the response is sent back only once the last function in the series execute OR if any of them fails due to error. Ideal for apis where sequence of the function execution matters.

**series.promise(request,reply)** Works similar to .execute() except that each function in the chain must return a promise and the next function in the chain is executed only once the previous one resolves.

**series.background(request,reply)** Starts invoking functions and immediately sents back a success response without waiting for any of the function to execute. Ideal for initiating background jobs that do not require monitoring.

**series.parallel(request,reply)** Works similar to .background() except that each function in the chain must return a promise and the response is sent only when all of the functions have resolved succesfully. 

#### What about reply() ?

You're free to call reply() anywhere in the function chain. This will just stop calling the next function in the chain and send the response directly to the client. hapi-next **DOES NOT** overrides the `reply()` method. 

### TODO

~~1. Add `Series.background()` to make functions execute in parallel that are independent and can immediately send a response.~~    

2. Add a method to **get** and **set** properties of **reply.data** instead of overwriting it on every function invocation.

