[![Coverage Status](https://coveralls.io/repos/github/jdalrymple/node-hg-plus/badge.svg?branch=master)](https://coveralls.io/github/jdalrymple/node-hg-plus?branch=master) [![Build Status](https://travis-ci.org/jdalrymple/node-hg-plus.svg?branch=master)](https://travis-ci.org/jdalrymple/node-hg-plus) [![Dependency Status](https://david-dm.org/jdalrymple/node-hg-plus/status.svg)](https://david-dm.org/jdalrymple/node-test#info=dependencies) [![devDependency Status](https://david-dm.org/jdalrymple/node-hg-plus/dev-status.svg)](https://david-dm.org/jdalrymple/node-test#info=devDependencies)

# node-hg-plus
=======

A node js client for [Mercurial](http://mercurial.selenic.com).

Supported node version => 7.6.0

## Installation

	npm install -S hg-plus

To use the gitify function, you must also have python2.7.x installed as well as the shipped gitifyhg python addon. 
To install the addon simply run: 

	cd node_modules/hg-plus/utils/gitifyhg/
	python2.7 setup.py install
	
Note this feature currently has mixed results on windows. Working on fixing that functionality for the next release.


## Usage
### Basic
```javascript
const Hg = require('hg-plus');

let repo = await Hg.clone('my/repository/url')
	
await repo.add()
await repo.commit('my example commit')
await repo.push({ password: 'myPassword', username: 'username' })

```

### Pushing repository

```javascript
const Hg = require('hg-plus');

let to = { url: 'my/repository/url', username: 'user', password: 'pass', path: 'path' }
let repo = await Hg.create(to);

await repo.push()

```

### Cloning from multiple repositories into a new one

```javascript
const Hg = require('hg-plus');

let to = {url: 'another/url', username:'user2', password: 'pass2', path: 'path2'};
let from = ['my/repository/url1', 'my/repository/url2', 'my/repository/url3']

let repo = await Hg.clone(from, to);

await repo.commit('I just created a repository from three other repositories!')
await repo.push({ password: 'myPassword', username: 'username' })

```


## API

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

### **Hg**

| Returns                | Description      |
|------------------------|------------------|
| Hg Instance            |                  |


*Example*

```javascript
const Hg = require('hg-plus');

```

### Hg.setPythonPath(path)

| Argument      | Description           | Type      | Required | Default           |
|---------------|-----------------------|-----------|----------|-------------------|
| path    | Path of python 2.7 installation. This is used for the gitify function | String    | No       | 'python' |

*Example*

```javascript
const Hg = require('hg-plus');

Hg.setPythonPath('python');

```

### Hg.clone(from, [to], [done])

Clones a Mercurial repository.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| from          |                       | String OR Array&lt;String&gt;  | Yes  |      |
| to            |                       | Object   | Yes when cloning from many origins, No otherwise       |                   |
| to.url        |                       | String   | No       | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory/&lt;Cloned repo name&gt; |
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise&lt;HgRepo&gt;  | Console output   |


*Example:*

```javascript
const Hg = require('hg-plus');

let from = 'my/repository/url';
let to = { url: 'another/url', username: 'user2', password: 'pass2', path: 'path2' };

let repo1 = await Hg.clone(from);

let repo2 = await Hg.clone(from, to);

Hg.clone(from, to, (error, results) => {
	console.log(results);
});

```

### Hg.create([options], [done = undefined])

Creates and initialized a Mercurial repository.

| Argument              | Description   | Type     | Required | Default           |
|-----------------------|---------------|----------|----------|-------------------|
| options.to            |               | Object   | No       |                   |
| options.to.url        |               | String   | No       | null              |
| options.to.username   |               | String   | No       | null              |
| options.to.password   |               | String   | No       | null              |
| options.to.path       |               | String   | No       | Current Directory |

| Returns                          | Description      |
|----------------------------------|------------------|
| Promise&lt;HgRepo&gt;            |                  |


*Example:*

To create a repo instance that is not initalized

```javascript
const Hg = require('hg-plus');

const repo = await Hg.create();

await repo.init()

await repo.add()
.then((output) => {
	console.log(output)
})

```

```javascript
let to = { url: 'my/repository/url', username: 'user', password: 'pass', path: 'path' };
let repo = await Hg.create(to);
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

### HgRepo([to],[pythonPath]) {

HgRepo instance. 

Mercurial repository wrapper to handle all the sub functions for mecurial repositories such as:
init,commit,add,push,pull,rename and merge

Note: These are only created through Hg.clone or Hg.create

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| to            |                       | Object   | No       |                   |
| to.url        |                       | String   | No       | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory |
| pythonPath    | Path of python 2.7 installation. This is used for the gitify function | String    | No       | 'python' |

| Returns                | Description      |
|------------------------|------------------|
| HgRepo Instance        |                  |

*Example:*
```javascript
const Hg = require('hg-plus');

let repo1 = await Hg.create();

let repo2 = await Hg.clone('my/repository/url');

```

### HgRepo.init([done]) {

Inits the Hg repo instance.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
const Hg = require('hg-plus');

let repo = await Hg.create();

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

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| message       | Commit message        | String   | Yes      | N/A               |
| options       |                       | Object   | No       | N/A               |
| options.add   |                       | Boolean  | No       | false             |
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
repo.commit('my commit message')
	.then((result) => {
		console.log(result);
	});

repo.commit('my commit message', (error, result) => {
	console.log(result);
});

```

### HgRepo.add([options], [done]) {

Adds untracked files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.files    |                       | Array<String>| No       | All Files         |
| options.include  |                       | String       | No       | null              |
| options.exclude  |                       | String       | No       | null              |
| options.subrepos |                       | Boolean      | No       | false             |
| options.dryRun   |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
repo.add()
	.then((result) => {
		console.log(result);
	});

repo.add(['file.txt','file2.js'], (error, result) => {
	console.log(result);
});

```

### HgRepo.push([options], [done]) {

Pushes untracked files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.force    |                       | Boolean      | No       | false             |
| options.revision |                       | String       | No       | null              |
| options.bookmark |                       | String       | No       | null              |
| options.branch   |                       | String       | No       | null              |
| options.ssh      |                       | String       | No       | null              |
| options.insecure |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


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

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| source           |                       | String       | No       | this.url          |
| options          |                       | Object       | No       | N/A               |
| options.force    |                       | Boolean      | No       | false             |
| options.update   |                       | Boolean      | No       | false              |
| options.revision |                       | String       | No       | null              |
| options.bookmark |                       | String       | No       | null              |
| options.branch   |                       | String       | No       | null              |
| options.ssh      |                       | String       | No       | null              |
| options.insecure |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
repo.pull()
	.then((result) => {
		console.log(result);
	});

repo.pull({source: 'my/repository/url/', force: true}, (error, result) => {
	console.log(result);
});

```

### HgRepo.update([options], [done]) {

Update Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.clean    |                       | Boolean      | No       | false             |
| options.check    |                       | Boolean      | No       | false              |
| options.revision |                       | String       | No       | null              |
| options.tool     |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

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

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.gitRepoPath | New git repository path | Boolean | No       | Current base directory/current hg repo name-git            |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
repo.gitify()
	.then((result) => {
		console.log(result);
	});

```

### HgRepo.rename([options], [done]) {

Rename files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| source           |                       | String       | Yes      | N/A               |
| destination      |                       | String       | Yes      | N/A               |
| options          |                       | Object       | No       | N/A               |
| options.after    |                       | Boolean      | No       | false             |
| options.force    |                       | Boolean      | No       | false             |
| options.include  |                       | String       | No       | null              |
| options.exclude  |                       | String       | No       | null              |
| options.dryRun   |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

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

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.force    |                       | Boolean      | No       | false             |
| options.preview  |                       | Boolean      | No       | false             |
| options.revision |                       | String       | No       | null              |
| options.tool     |                       | String       | No       | null              |
| done             | Callback function     | Function     | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

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

Changelog
=========
[0.9.0](https://github.com/jdalrymple/node-hg-plus/commit/) (2017-07-20)
------------------
- Cleaned up old promise logic and replaced with async/await
- Removed usless rest param arguments from many of the Hg functions for clarity
- Added Object input to the Hg.Clone function (See API Docs above)
- Cleaned up folder structure
- Fixed the setting of the default url if none is passed in by the user
 

