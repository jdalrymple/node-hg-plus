# node-hg-plus
=======

A node js client for [Mercurial](http://mercurial.selenic.com).

# Installation

    npm install -S hg-plus

# Basic Examples

```javascript
const Hg = require('hg-plus')

let repo = Hg.clone('some/repo/url')

repo.add()
.then(() => repo.commit())
.then(() => repo.push())

```

Supports both Promises and Standard callbacks!

# API

## Hg

##### Hg([pythonPath = 'python'])

###### *Options:*
	{String} pythonPath - Path of python 2.7 installation

###### *Example:*

```javascript
const Hg = require('hg-plus');

const Hg = require('hg-plus')('path/to/python');

```

##### Hg.clone(from, [to = undefined], [done = undefined])

Clones a Mercurial repository.

###### *Options:*
  {Object} from
  {String} [from.url = null]
  {String} [from.username = null]
  {String} [from.password = null]
  {String} [from.path = null]

  {Object} [to = undefined]
  {String} [to.url = null]
  {String} [to.username = null]
  {String} [to.password = null]
  {String} [to.path = process.cwd()]

  {Function} [done] - Callback function

###### *Returns:* 
  {Promise<String>} - Console output

###### *Example:*

```javascript
const Hg = require('hg-plus');

let from = {url:'someurl',username:'user',password:'pass',path:'path'};
Hg.clone(from);

let from = {url:'someurl',username:'user',password:'pass',path:'path'};
let to = {url:'anotherurl',username:'user2',password:'pass2',path:'path2'};
Hg.clone(from, to);

let from = {url:'someurl',username:'user',password:'pass',path:'path'};
Hg.clone(from, null, (results) => {
	console.log(results);
});

```

<<<<<<< HEAD
### Exposed Base Class
=======
Hg.create([to], [done = undefined])
=======
##### Hg.create([to], [done = undefined])
>>>>>>> d56d810... Fixing formatting

Creates and initialized a Mercurial repository

###### *Options:*
  {Object} [to = undefined]
  {String} [to.url = null]
  {String} [to.username = null]
  {String} [to.password = null]
  {String} [to.path = process.cwd()]
  
  {Function} [done] - Callback function

###### *Returns:* 
  {Promise<String>} - Console output

###### *Example:*

```javascript
const Hg = require('hg-plus');

Hg.create()
	.then((results) => {
		console.log(results);
	});

let to = {url: 'someurl', username: 'user', password: 'pass', path: 'path'};
Hg.create(to);

let to = {url: 'someurl', username: 'user', password: 'pass', path: 'path'};
Hg.create(to,(results) => {
	console.log(results);
});

```

##### Hg.gitify([{gitRepoPath: 'python'}], [done = undefined])

Create a git copy of this repository

###### *Options:*
   {Object}   [options]
   {Object}   [options.gitRepoPath] - Destination path for the new git repo
   {Function} [done] - Callback function

###### *Returns:* 
   {Promise<String>} - Console output

###### *Example:*

```javascript
const Hg = require('hg-plus');

Hg.gitify()
	.then((results) => {
		console.log(results);
	});

Hg.gitify({gitRepoPath: 'some/path/here'}, (results) => {
	console.log(results);
});

```

##### Hg.version([{gitRepoPath: 'python'}], [done = undefined])

Gets the version of the installed mercurial package

###### *Options:*
   {Function} [done] - Callback function

###### *Returns:* 
   {Promise<String>} - Console output

###### *Example:*

```javascript
const Hg = require('hg-plus');

Hg.version()
	.then((version) => {
		console.log(version);
	});

Hg.version((results) => {
	console.log(results);
});

```
#### HgRepo

Release Notes
=============

TODO
=============
1. Add tests for push command
2. Add tests for credentials handling

LICENSE
=======

MIT, Copyright 2016 Justin Dalrymple
=======
[MIT](http://opensource.org/licenses/MIT), No Attribution Required, Copyright 2016 [Justin Dalrymple]
