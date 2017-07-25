[![Coverage Status](https://coveralls.io/repos/github/jdalrymple/node-hg-plus/badge.svg?branch=master)](https://coveralls.io/github/jdalrymple/node-hg-plus?branch=master) [![Build Status](https://travis-ci.org/jdalrymple/node-hg-plus.svg?branch=master)](https://travis-ci.org/jdalrymple/node-hg-plus) [![Dependency Status](https://david-dm.org/jdalrymple/node-hg-plus/status.svg)](https://david-dm.org/jdalrymple/node-test#info=dependencies) [![devDependency Status](https://david-dm.org/jdalrymple/node-hg-plus/dev-status.svg)](https://david-dm.org/jdalrymple/node-test#info=devDependencies)

node-hg-plus
==============

A node js client for [Mercurial](http://mercurial.selenic.com). Supports both Async/Await/Promises and Standard callbacks.

Supported node version => 7.6.0

 
Table of Contents
==================
* [Install](#install)
* [Usage](#usage)
* [Docs](#docs)
	* [Hg](https://github.com/jdalrymple/node-hg-plus/blob/master/docs/hg.md)
	* [HgRepo](https://github.com/jdalrymple/node-hg-plus/blob/master/docs/hgrepo.md)
* [License](#licence)
* [Changelog](#changelog)

Install
=======

```bash
# Install from npm

npm install -S hg-plus
```

To use the gitify function, you must also have python2.7.x installed as well as the shipped gitifyhg python addon. 
To install the addon simply run: 

```bash
cd node_modules/hg-plus/utils/gitifyhg/
python2.7 setup.py install
```
	
Note this feature currently has mixed results on windows. Working on fixing that functionality for the next release.

Usage
=====

Basic 

```javascript
// Initialize with default python path ('python')
const Hg = require('hg-plus')();

// Clone a repo using only the url string
let repo = await Hg.clone('http://hostname.com/my/repository/url')
	
await repo.add()
await repo.commit('my example commit')
await repo.push({ password: 'myPassword', username: 'username' })
```

Create and push a repository

```javascript
const Hg = require('hg-plus')();

let to = { 
	url: 'http://hostname.com/my/repository/url', 
	username: 'me@host.com', 
	password: 'secret'
}

let repo = await Hg.create(to);

await repo.push()

```

Cloning from multiple repositories into a new one

```javascript
const Hg = require('hg-plus')();

let to = { 
	url: 'http://hostname.com/my/repository/url'
}

let from = [
	'http://hostname.com/my/repository/url1', 
	'http://hostname.com/my/repository/url2', 
	'http://hostname.com/my/repository/url3'
]

let repo = await Hg.clone(from, to);

await repo.commit('I just created a repository from three other repositories!')
await repo.push({ 	
	username: 'me@host.com', 
	password: 'secret'
})

```

Tests 
=====
First make sure to change the global variable in tests/HgRepo called pythonPath to be a valid
path to your python2.7.x installation. Then run:

```javascript
npm test
```

LICENSE
=======

[MIT](http://opensource.org/licenses/MIT), No Attribution Required, Copyright 2016 Justin Dalrymple

Changelog
=========
[1.0.0](https://github.com/jdalrymple/node-hg-plus/commit/) (2017-07-20)
------------------
- Cleaned up old promise logic and replaced with async/await
- Removed usless rest param arguments from many of the Hg functions for clarity
- Added Object input to the Hg.Clone function (See API Docs above)
- Cleaned up folder structure
- Fixed the setting of the default url if none is passed in by the user
- Fixed cloning from urls instead of local paths
- Added various callback tests to ensure the callback backwards compatibility is maintained
- Added default state tests for the HgRepo Object
- Removed old dependancies now that Promises are more widely supported