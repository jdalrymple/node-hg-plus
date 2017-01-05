[![Coverage Status](https://coveralls.io/repos/github/jdalrymple/node-hg-plus/badge.svg?branch=master)](https://coveralls.io/github/jdalrymple/node-hg-plus?branch=master) [![Build Status](https://travis-ci.org/jdalrymple/node-hg-plus.svg?branch=master)](https://travis-ci.org/jdalrymple/node-hg-plus) [![Dependency Status](https://david-dm.org/jdalrymple/node-hg-plus/status.svg)](https://david-dm.org/jdalrymple/node-test#info=dependencies) [![devDependency Status](https://david-dm.org/jdalrymple/node-hg-plus/dev-status.svg)](https://david-dm.org/jdalrymple/node-test#info=devDependencies)

# node-hg-plus
=======

A node js client for [Mercurial](http://mercurial.selenic.com).

Supported node version => 6.0.0

## Installation

	npm install -S hg-plus

To use the gitify function, you must also have python2.7.x installed as well as the shipped gitifyhg python addon. 
To install the addon simply run: 

	cd node_modules/hg-plus/utils/gitifyhg/
	python2.7 setup.py install
	
Note this feature currently doesnt work on windows. Working on building that functionality for the next release.

## Usage

```javascript
const Hg = require('hg-plus')

let repo = Hg.clone('some/url')

repo.add()
.then(() => repo.commit('my example commit'))
.then(() => repo.push())

```

Supports both Promises and Standard callbacks following this structure

```javascript
Promise
.then(()=>{
	
})
.catch((error)=>{
	
});

Callback((error, output)=>{
	
})

```

## API

### **Hg**

### Hg([pythonPath])

| Argument      | Description           | Type      | Required | Default           |
|---------------|-----------------------|-----------|----------|-------------------|
| pythonPath    | Path of python 2.7 installation. This is used for the gitify function | String    | No       | 'python' |

| Returns                | Description      |
|------------------------|------------------|
| Hg Instance            |                  |


*Example*

```javascript
const Hg = require('hg-plus');

const Hg = require('hg-plus')(pythonPath:'path/to/python');

```

### Hg.clone(from, [to], [done])

Clones a Mercurial repository.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| from          |                       | String   | Yes      |                   |
| to            |                       | Object   | No       |                   |
| to.url        |                       | String   | No       | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory |
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*

```javascript
const Hg = require('hg-plus');

let from = 'some/url';
Hg.clone(from);

let to = {url:'another/url',username:'user2',password:'pass2',path:'path2'};
Hg.clone(from, to);

Hg.clone(from, null, (error, results) => {
	console.log(results);
});

```

#### Hg.create([to], [done = undefined])

Creates and initialized a Mercurial repository

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| to            |                       | Object   | No       |                   |
| to.url        |                       | String   | No       | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory |
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*

```javascript
const Hg = require('hg-plus');

Hg.create()
	.then((results) => {
		console.log(results);
	});

let to = {url: 'some/url', username: 'user', password: 'pass', path: 'path'};
Hg.create(to);

let to = {url: 'someurl', username: 'user', password: 'pass', path: 'path'};
Hg.create(to,(error, results) => {
	console.log(results);
});

```

### Hg.gitify([options], [done])

Create a git copy of this repository using the [gitifyhg](https://github.com/buchuki/gitifyhg) python package

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| options       |                       | Object   | No       |                   |
| options.gitRepoPath   |               | String   | No       | Base Directory / Current Hg repo name-git              |
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*

```javascript
const Hg = require('hg-plus');

Hg.gitify()
	.then((results) => {
		console.log(results);
	});

Hg.gitify({gitRepoPath: 'some/path/here'}, (error, results) => {
	console.log(results);
});

```

### Hg.version([done])

Gets the version of the installed mercurial package

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*

```javascript
const Hg = require('hg-plus');

Hg.version()
	.then((version) => {
		console.log(version);
	});

Hg.version((error, results) => {
	console.log(results);
});

```

### **HgRepo**

### HgRepo([options],[pythonPath]) {

HgRepo instance.

**Options:**
>{Object} options	
{String} [options.url = null]	
{String} [options.username = null]	
{String} [options.password = null]	
{String} [options.path = null]	
{String} [pythonPath = 'python']

**Returns:**
>{HgRepo}

*Example:*
```javascript
const HgRepo = require('hg-plus').HgRepo;

let repo = new HgRepo();

```

### HgRepo.init([done]) {

Inits the Hg repo instance.

**Options:**
>{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
const HgRepo = require('hg-plus').HgRepo;

let repo = new HgRepo();

repo.init()
	.then((result) => {
		console.log(result);
	});

repo.init((error, result) => {
	console.log(result);
});

```

### HgRepo.commit(message, [options], [done]) {

Commits new changes in the the Hg repo instance.

**Options:**
>{String} message	
{Function} [done = undefined] - Callback function
{Boolean} [options.add = false]		


**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.commit('my commit message')
	.then((result) => {
		console.log(result);
	});

repo.commit('my commit message',(error, result) => {
	console.log(result);
});

```

### HgRepo.add([options], [done]) {

Adds untracked files to the Hg repo instance.

**Options:**
>{Array} [options.files] - Adds all non tracked files if none specified		
{String} [options.include = null]	
{String} [options.exclude = null]	
{Boolean} [options.subrepos = null]		
{Boolean} [options.dryRun = null]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.add()
	.then((result) => {
		console.log(result);
	});

repo.add(['file.txt','file2.js'],(error, result) => {
	console.log(result);
});

```

### HgRepo.push([options], [done]) {

Pushes untracked files to the Hg repo instance.

**Options:**
>{Object} [options]	
{Boolean} [options.force = false]	
{String} [options.revision = null]	
{String} [options.bookmark = null]	
{String} [options.branch = false]	
{String} [options.ssh = null]	
{Boolean} [options.insecure = false]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.push()
	.then((result) => {
		console.log(result);
	});

repo.push({force: true}, (error, result) => {
	console.log(result);
});

```

### HgRepo.pull([options], [done]) {

Pulls files to the Hg repo instance.

**Options:**
>{String} [source = this.url]
{Object} [options]		
{Boolean} [options.force = false]	
{Boolean} [options.update = false]	
{String} [options.revision = null]	
{String} [options.bookmark = null]	
{String} [options.branch = null]	
{String} [options.ssh = null]	
{Boolean} [options.insecure = null]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.pull()
	.then((result) => {
		console.log(result);
	});

repo.pull({source: 'some/url/', force: true}, (error, result) => {
	console.log(result);
});

```

### HgRepo.update([options], [done]) {

Update Hg repo instance.

**Options:**
>{Object} [options]		
{Boolean} [options.clean = false]	
{Boolean} [options.check = false]	
{String} [options.revision = null]	
{String} [options.tool = null]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.update()
	.then((result) => {
		console.log(result);
	});

repo.update({clean: true}, (error, result) => {
	console.log(result);
});

```

### HgRepo.gitify([{gitRepoPath}], [done]) {

Coverts Hg repo instance into a Git repo using the [gitifyhg](https://github.com/buchuki/gitifyhg) python package

**Options:**
>{Object} [options]		
{Object} [options.gitRepoPath] - Destination path for the python27 executable	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.gitify()
	.then((result) => {
		console.log(result);
	});

```

### HgRepo.rename([options], [done]) {

Rename files to the Hg repo instance.

**Options:**
>{String} source,
{String} destination
{Object} [options]		
{Boolean} [options.after = false]	
{Boolean} [options.force = false]	
{String} [options.include = null]	
{String} [options.exclude = null]	
{Boolean} [options.dryRun = null]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.rename('one/path','destination/path')
	.then((result) => {
		console.log(result);
	});

repo.rename('one/path','destination/path',{after: true}, (error, result) => {
	console.log(result);
});

```

### HgRepo.merge([options], [done]) {

Rename files to the Hg repo instance.

**Options:**
>{Object} [options]		
{Boolean} [options.force = false]	
{Boolean} [options.preview = false]		
{String} [options.revision = null]		
{String} [options.tool = null]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.merge()
	.then((result) => {
		console.log(result);
	});

repo.merge({force: true}, (error, result) => {
	console.log(result);
});

```
Tests 
=====
First make sure to change the global variable in tests/HgRepo called pythonPath to be a valid
path to your python2.7.x installation. Then run:

```javascript
npm test
```

Release Notes
=============

TODO
=============
1. Add tests for credentials handling

LICENSE
=======

[MIT](http://opensource.org/licenses/MIT), No Attribution Required, Copyright 2016 Justin Dalrymple
