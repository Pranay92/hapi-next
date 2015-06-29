## hapi-next             

Add modularity to your route handlers.

[![Build Status](https://travis-ci.org/Pranay92/hapi-next.svg?branch=master)](https://travis-ci.org/Pranay92/hapi-next)

Install via **npm**

`npm install hapi-next`


## Important !!

> **Series.promise** has been removed since version **0.2.1**. Also **Series.execute** function and its function signature has been changed. See below example for changes:

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
function validate(request,reply,data) {
  reply.continue();
}

function someFuncToGetData(request,reply,data) {
  db.persons.queryAsync(request.query,function(err,persons) {
    if(err) {
      return reply.continue(err);
    }
    reply.data = persons;
    reply.continue();
  });
}

function processSomeData(request,reply,data) {
  var processed = [];
  data.forEach(function(dataObj) {
    processed.push(dataObj.name);
  });
  reply.data = processed;
  reply.continue();
}
```

###Methods

**reply.continue(err)**  This tells hapi-next to continue executing the next function in the chain. If error is passed as a non-null value, this will break the execution chain and will send the error response back to client

**reply.data** Object used to pass data between function as a third argument **data** for the next function in the chain. (see function signature in the above example). This defaults to an empty object({}). 

#### What about reply() ?

You're free to call reply() anywhere in the function chain. This will just stop calling the next function in the chain and send the response directly to the client. hapi-next DOES NOT overrides the reply() method. 



