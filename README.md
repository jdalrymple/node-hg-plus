# node-hg-plus
=======

A node js client for [Mercurial](http://mercurial.selenic.com).

## Installation
	npm install -S hg-plus

## Basic Examples

```javascript
const Hg = require('hg-plus')

let repo = Hg.clone('some/repo/url')

repo.add()
.then(() => repo.commit())
.then(() => repo.push())

```

Supports both Promises and Standard callbacks!

## API

### **Hg**

### Hg([pythonPath = 'python'])

**Options:**
>{String} pythonPath - Path of python 2.7 installation

*Example:*

```javascript
const Hg = require('hg-plus');

const Hg = require('hg-plus')('path/to/python');

```

### Hg.clone(from, [to], [done])

Clones a Mercurial repository.

**Options:**
>{Object} from	
{String} [from.url = null]	
{String} [from.username = null]		
{String} [from.password = null]		
{String} [from.path = null]		
{Object} [to = undefined]	
{String} [to.url = null]	
{String} [to.username = null]	
{String} [to.password = null]	
{String} [to.path = process.cwd()]	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*

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

### Exposed Base Class
=======

#### Hg.create([to], [done = undefined])

Creates and initialized a Mercurial repository

**Options:**
>{Object} [to = undefined]	
{String} [to.url = null]	
{String} [to.username = null]	
{String} [to.password = null]	
{String} [to.path = process.cwd()]	
{Function} [done = undefined] - Callback function

*Returns:*
>{Promise &lt;String&gt;} - Console output

*Example:*

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

### Hg.gitify([options], [done])

Create a git copy of this repository

**Options:**
>{Object} [options]		
{Object} [options.gitRepoPath = 'python'] - Destination path for the new git repo	
{Function} [done = undefined] - Callback function

*Returns:*
>{Promise &lt;String&gt;} - Console output

*Example:*

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

### Hg.version([done])

Gets the version of the installed mercurial package

**Options:**
>{Function} [done = undefined] - Callback function

*Returns:*
>{Promise &lt;String&gt;} - Console output

*Example:*

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

repo.init((result) => {
	console.log(result);
});

```

### HgRepo.commit(message, [done]) {

Commits new changes in the the Hg repo instance.

**Options:**
>{String} message	
{Function} [done = undefined] - Callback function

**Returns:**
>{Promise &lt;String&gt;} - Console output

*Example:*
```javascript
repo.commit('my commit message')
	.then((result) => {
		console.log(result);
	});

repo.commit('my commit message',(result) => {
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

repo.add(['file.txt','file2.js'],(result) => {
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

repo.push({force: true}, (result) => {
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

repo.pull({source: 'some/url/', force: true}, (result) => {
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

repo.update({clean: true}, (result) => {
	console.log(result);
});

```

### HgRepo.gitify([{gitRepoPath}], [done]) {

Coverts Hg repo instance into a Git repo.

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

repo.rename('one/path','destination/path',{after: true}, (result) => {
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

repo.merge({force: true}, (result) => {
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
1. Add tests for push command
2. Add tests for credentials handling

LICENSE
=======

MIT, Copyright 2016 Justin Dalrymple
=======
[MIT](http://opensource.org/licenses/MIT), No Attribution Required, Copyright 2016 [Justin Dalrymple]
