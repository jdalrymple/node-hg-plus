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