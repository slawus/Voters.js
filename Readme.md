# Voters.js

Minimalistic JS implementation of [Symfony2 Voters](http://symfony.com/doc/current/cookbook/security/voters.html) mechanism.

[![Build Status](https://travis-ci.org/slawus/Voters.js.svg?branch=master)](https://travis-ci.org/slawus/Voters.js)

## Installation

```bash
$ npm install voters
```

## What is it?
Voters are simple mechanism which allows you to manage users permissions inside code.

### ...but we have ACL...

Access Control Lists (e.g. [node_acl](https://github.com/OptimalBits/node_acl)) are great way of managing user's permissions. However in many cases may be a little bit overwhelming. Their work involves creating roles which are assigned to answer for resources. These roles are assigned to users, which allows you to check whether an individual can perform a particular action. As you can see, there is a lot of relations. It's not huge issue if you have limited number of roles, but may be if your roles depends on resources.

Imagine a simple blog system, where every authenticated user can post a message that is visible to anyone (even anonymous users). In other words, we have 3 roles:
- USER
- GUEST
- ADMINISTRATOR

and 1 resource: *MESSAGE*.

Now imagine, that users are allowed to remove messages written by them. That's where problem starts to get a little bit tricky. To achieve this with ACL, you need to create **special role for every message**, i.e. *MESSAGE_AUTHOR_#ID* (ID is message id), which will allow user to perform deletion only on this message. Ofcourse to achieve this, you still need to create new resource just for thi message, e.g. *MESSAGE_#ID*. Than you have 3 + n roles, and 1 + n resources (where n is number of messages). It starts to look bad right?

Let's make it even worse! now imagine that authenticated users can post comments to messages, which can be deleted by their authors and parent message author. In this case you have roles:
- USER
- GUEST
- ADMINISTRATOR
- MESSAGE_AUTHOR_#ID * n (n = number of messages)
- COMMENT_AUTHOR_#ID * k (k = number of comments)

And resources:
- MESSAGE
- COMMENT
- MESSAGE_#ID * n
- COMMENT_#ID * k

So it grows bigger and bigger. What is more, some of this relations are hardly cachable, as you have to update them (i.e. you have to add relations between message author and newly added mesasge comments). Now imagine how it grows in your database. Depending on databse engine (MongoDB, SQL etc.) it will probably couse performance issues at some stage [^1]. What is more, in most cases it's all duplicated data, as you probably store comment/message author within its entity.

### Voters to the rescue!

Voter's allows you to replace this huge amount of data, with simple conditions. It's much simple to write: 

```javascript 
return message.author == user ? ALLOW : DENY
```

isn't it?

## Usage

```javascript 
var myCustomVoter = ...; //your voter, more in "Voter creation"

var Voters = require('Voters');
var security = new Voters();
security.registerVoter(myCustomVoter);

//check permissions
security.isAllowed(user, message, 'DELETE', function(err, decision) {
	if(decision) {
    	messages.delete(message);
    }
});
```

You can register as many voters as you want. If there is more then one voter that supports given permission and resource, decision from voter with higher priority will be given (at least for now, check **TODO**). However if it cannot make a clear decision (returns Voter.DECISION.ABSTAIN), proccess moves to next voter. Voters priority is determined by order in which they were registered.


### Voter creation

Voters are small objects, that encapsulates logic needed to determine if user has permission to given action on resource. It must implements methods:

- **vote**: function (user, resource, permission, function(err, decision) ) - determines if user has permission to perform action on resource. Decision should be one of values:
	* Voters.DECISION.ACCESS_GRANTED - allow user
	* Voters.DECISION.ACCESS_DENIED - deny user
	* Voters.DECISION.ACCESS_ABSTAIN - can't make decision

	Arguments:
    
    ```javascript 
    	user {Mixed} 
		resource {Mixed} 
    	permission {Mixed} 
	    cb {Function} callback called after decision making
	```

- **supportsResource**: function (resource) - return true if Voter supports given resource, false if not

	Arguments:
    
	```javascript 
		resource {Mixed} resource passed to vote() method
	```
- **supportsPermission**: function (permission) - should return boolean value whever Voter can decide about given permission

	Arguments:
    
    ```javascript 
	    permission {Mixed} permission passed to vote() method
    ```
    
### API Doc

You can find complete Api doc [here](docs/)!


## To do

- move from callbacks (everyone knows [why](http://callbackhell.com/)) to Promises.
- implement all [strategies](http://symfony.com/doc/current/cookbook/security/voters.html#changing-the-access-decision-strategy) defined in Symfony 2. For now, Voters.js uses only "Affirmative" strategy.
- ready-for-use Voter for [node_acl](https://github.com/OptimalBits/node_acl) integration with Voters.js

[^1]: http://stackoverflow.com/questions/14235335/node-js-and-acl#comment43384676_14243432.