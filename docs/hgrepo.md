## HgRepo

* [Information about a HgRepo Object](#hgrepo-instance)
* [Hg init](#hg-init)
* [Hg commit](#hg-commit)
* [Hg add](#hg-add) 
* [Hg push](#hg-push) 
* [Hg pull](#hg-pull) 
* [Hg update](#hg-update) 
* [Hg rename](#hg-rename) 
* [Hg merge](#hg-merge) 
* [Convert repo from Hg to Git](#convert-repo-from-hg-to-git) 

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

### Hg init

Inits the Hg repo instance.

| Argument      | Description           | Type     | Required | Default           |
|---------------|-----------------------|----------|----------|-------------------|
| done          | Callback function     | Function | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
const Hg = require('hg-plus')();

let repo = await Hg.create({ name: 'my-fancy-repo' });

let output = await repo.init();

console.log(result);

// OR

repo.init((error, result) => {
	console.log(result);
});

```

### Hg commit

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

// OR

repo.commit('my commit message', (error, result) => {
	console.log(result);
});

```

### Hg add

Adds untracked files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.files    |                       | Array<String>| No       | All Files         |
| options.include  |                       | String       | No       | null              |
| options.exclude  |                       | String       | No       | null              |
| options.subrepos |                       | Boolean      | No       | false             |
| options.dryRun   |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
let output = await repo.add();

console.log(result);

// OR

repo.add(['file.txt','file2.js'], (error, result) => {
	console.log(result);
});

```

### Hg push

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
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
let output = await repo.push();

console.log(result);
	
// OR

repo.push({force: true}, (error, result) => {
	console.log(result);
});

```

### Hg pull

Pulls files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| source           |                       | String       | No       | this.url          |
| options          |                       | Object       | No       | N/A               |
| options.force    |                       | Boolean      | No       | false             |
| options.update   |                       | Boolean      | No       | false             |
| options.revision |                       | String       | No       | null              |
| options.bookmark |                       | String       | No       | null              |
| options.branch   |                       | String       | No       | null              |
| options.ssh      |                       | String       | No       | null              |
| options.insecure |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
let output = await repo.pull();

console.log(result);

// OR

repo.pull({source: 'my/repository/url/', force: true}, (error, result) => {
	console.log(result);
});

```

### Hg update

Update Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.clean    |                       | Boolean      | No       | false             |
| options.check    |                       | Boolean      | No       | false             |
| options.revision |                       | String       | No       | null              |
| options.tool     |                       | Boolean      | No       | false             |
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
let output = await repo.update();

console.log(result);

// OR

repo.update({clean: true}, (error, result) => {
	console.log(result);
});

```

### Hg rename

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
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
output = await repo.rename('one/path','destination/path');

console.log(result);

// OR

repo.rename('one/path','destination/path',{after: true}, (error, result) => {
	console.log(result);
});

```

### Hg merge

Rename files to the Hg repo instance.

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.force    |                       | Boolean      | No       | false             |
| options.preview  |                       | Boolean      | No       | false             |
| options.revision |                       | String       | No       | null              |
| options.tool     |                       | String       | No       | null              |
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |

*Example:*
```javascript
let output = await repo.merge();

console.log(result);

// OR

repo.merge({force: true}, (error, result) => {
	console.log(result);
});

```

### Convert repo from Hg to Git

Coverts Hg repo instance into a Git repo using the [gitifyhg](https://github.com/buchuki/gitifyhg) python package

| Argument         | Description           | Type         | Required | Default           |
|------------------|-----------------------|--------------|----------|-------------------|
| options          |                       | Object       | No       | N/A               |
| options.path | New git repository path | Boolean | No       | Current base directory/current hg repo name-git            |
| done             | Callback function     | Function     | No       |                   |

| Returns                | Description      |
|------------------------|------------------|
| Promise &lt;String&gt; | Console output   |


*Example:*
```javascript
let output = await repo.gitify();
console.log(result);


// OR

repo.gitify({ path:'my/git/repo/path' }, (error, result) => {
	console.log(result);
});
```
