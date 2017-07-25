## HgRepo

* [Information about a HgRepo Object](#hgrepo-instance)
* [Init a repo](#init-a-repo)
* [Commit repo changes](#commit-repo-changes)
* [Edit a hook](#edit-a-hook) 
* [Remove a hook](#remove-a-hook) 

### HgRepo instance

Mercurial repository wrapper to handle all the sub functions for mecurial repositories such as:
init,commit,add,push,pull,rename and merge

Note: These are only created through Hg.clone or Hg.create

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| to            |                       | Object   | Yes      |                   |
| to.url*       |                       | String   | Yes      | null              |
| to.name*      |                       | String   | Yes      | null              |
| to.username   |                       | String   | No       | null              |
| to.password   |                       | String   | No       | null              |
| to.path       |                       | String   | No       | Current Directory |
| pythonPath    | Path of python 2.7 installation. This is used for the gitify function | String    | No       | 'python' |

* Only one of these must be passed.

| Returns                | Description      |
|------------------------|------------------|
| HgRepo Instance        |                  |

*Example:*
```javascript
const Hg = require('hg-plus')();

let repo1 = await Hg.create({ name: 'my-fancy-repo' });

let repo2 = await Hg.clone({ url: 'http://hostname.com/my/repository/url' });

```

### Init a repo

Inits the Hg repo instance.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| done          | Callback function     | Function | No       | null              |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
const Hg = require('hg-plus')();

let repo = await Hg.create({ name: 'my-fancy-repo' });

let output = await repo.init()

console.log(result);

// OR

repo.init((error, result) => {
	console.log(result);
});

```

### Commit repo changes

Commits new changes in the the Hg repo instance.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| message       | Commit message        | String   | Yes      | N/A               |
| options       |                       | Object   | No       | N/A               |
| options.add   |                       | Boolean  | No       | false             |
| done          | Callback function     | Function | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
let output = repo.commit('my commit message');
console.log(output);

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