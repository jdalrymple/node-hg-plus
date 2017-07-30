## Hg

* [Hg Instance](#hg-instance)
* [Hg clone](#hg-clone)
* [Hg create](#hg-create)
* [Hg version](#hg-version) 
* [Gitify the repo youre currently in](#gitify-the-repo-youre-currently-in)

### Hg Instance

| Argument      | Description              | Type     | Required | Default           |
|---------------|--------------------------|----------|----------|-------------------|
| path          | Python installation path | String   | No       |  'python'         |


| Returns                | Description      |
|------------------------|------------------|
| Hg Instance            |                  |



```javascript
const Hg = require('hg-plus')();

// OR

const Hg = require('hg-plus')({ path: 'python2.7' });

```

### Hg clone

Clones a Mercurial repository.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| from          |                       | Object OR String OR Array&lt;String&gt;  | Yes  |        |
| to            |                       | Object   | Yes      |                   |
| to.url*       |                       | String   | Yes      | null              |
| to.name*      |                       | String   | Yes      | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory/&lt;Cloned repo name&gt; |
| done          | Callback function     | Function | No       |                   |

* Only one of these must be passed.

| Returns                | Description      |
|------------------------|------------------|
| Promise&lt;HgRepo&gt;  | Console output   |


```javascript
const Hg = require('hg-plus')();

let to = { 
	url: 'http://hostname.com/my/repository/url', 
	username: 'me@host.com', 
	password: 'secret', 
	path: 'path/to/my/new/repo' 
};


// Basic from a repo url
let fromURL = 'http://hostname.com/the/repo/i/want/to/clone';

let repo1 = await Hg.clone(fromURL, to);

// From a repo object
let fromObj = { 
	url: 'http://hostname.com/the/repo/i/want/to/clone', 
	username: 'me@host.com', 
	password: 'secret', 
};

let repo2 = await Hg.clone(fromObj, to);

// From a list of repo urls/objects
let fromArray = [
{ 
	url: 'http://hostname.com/the/repo/i/want/to/clone1', 
	username: 'me@host.com', 
	password: 'secret', 
},{ 
	url: 'http://hostname.com/the/repo/i/want/to/clone2', 
	username: 'me@host.com', 
	password: 'secret', 
}];

let repo3 = await Hg.clone(fromArray, to);

// Similar functionality with the callback structure
Hg.clone(from, to, (error, results) => {
	console.log(results);
});

```

### Hg create

Creates and initialized a Mercurial repository.

| Argument              | Description   | Type     | Required | Default           |
|-----------------------|---------------|----------|----------|-------------------|
| options.to            |               | Object   | No       |                   |
| options.to.url        |               | String   | No       | null              |
| options.to.username   |               | String   | No       | null              |
| options.to.password   |               | String   | No       | null              |
| options.to.path       |               | String   | No       | Current Directory |
| done          | Callback function     | Function | No       |                   |

| Returns                          | Description      |
|----------------------------------|------------------|
| Promise&lt;HgRepo&gt;            |                  |


```javascript
const Hg = require('hg-plus')();

// Basic
const repo = await Hg.create();

await repo.init();

// With an object
let to = { 
	url: 'http://hostname.com/my/repository/url', 
	username: 'me@host.com', 
	password: 'secret', 
	path: 'path/to/my/new/repo' 
};

let repo = await Hg.create(to);

await repo.init();

```


### Hg getRepo

Get a HgRepo instance from an already existing Mercurial repository.

| Argument               | Description   | Type     | Required | Default           |
|------------------------|---------------|----------|----------|-------------------|
| options.from           |               | Object   | No       |                   |
| options.from.url       |               | String   | No       | null              |
| options.from.username  |               | String   | No       | null              |
| options.from.password  |               | String   | No       | null              |
| options.from.path      |               | String   | No       | Current Directory |

| Returns                          | Description      |
|----------------------------------|------------------|
| Promise&lt;HgRepo&gt;            |                  |

```javascript

const repo = Hg.getRepo({
	url: 'http://hostname.com/my/repository/url',
   	username: 'me@host.com',
   	password: 'secret',
    path: 'my/local/cloned/repo'
})

await repo.pull()

```


### Hg version

Gets the version of the installed mercurial package

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| done          | Callback function     | Function | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


```javascript
const Hg = require('hg-plus')();

let version = await Hg.version();

console.log(version);

// OR

Hg.version((error, results) => {
	console.log(results);
});

```

### Gitify the repo youre currently in

Create a git copy of this repository using the [gitifyhg](https://github.com/buchuki/gitifyhg) python package

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| options       |                       | Object   | No       |                   |
| options.path  |                       | String   | No       | Base Directory / Current Hg repo name-git              |
| done          | Callback function     | Function | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise                | null             |


```javascript
const Hg = require('hg-plus')();

await Hg.gitify();

// OR

Hg.gitify({gitRepoPath: 'some/path/here'}, (error, results) => {
	console.log(results);
});

```
