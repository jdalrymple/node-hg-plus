const Exec = require('child-process-promise').exec;
const Promise = require('bluebird');
const Fs = require('fs-extra-promise');

function runCommand(command, options) {
  return new Promise((resolve, reject) => {
    Exec(`hg ${command} ${options.join(' ')}`)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = class HgRepo {
  /*
  Create a HgRepo with a root path defined by the passed in `@path`
  (defaults to `process.cwd()`)
  */
  constructor(credentials, path = process.cwd()) {
    this.path = path;
    this.username = credentials.username;
    this.password = credentials.password;

    Fs.ensureDir(path);
  }

  /*
  Initialize a new repository at the provided path.
  */
  init() {
    return runCommand('init', [this.path])
      .then(() => this);
  }

  /* hg clone REPO1 work         # Again, pull from both repos...
   cd work
   hg pull -f REPO2
   hg update -C tip            # Now update to the REPO2 tip...
   mkdir lib2                  # And rename everything...
   hg rename * lib2
   hg commit -m "Move everything into lib2 directory."
   hg merge                    # Then simply merge.
   hg commit


-A  --after record a rename that has already occurred
-f  --force forcibly copy over an existing managed file
-I  --include PATTERN [+] include names matching the given patterns
-X  --exclude PATTERN [+] exclude names matching the given patterns
-n  --dry-run do not perform actions, just print output
hg rename -X '**.py' src

 hg rename -f -v -I '*.c' ./ banana
moving one.c to .banana\one.c
moving two.c to .banana\two.c
moving three.c to .banana\three.c
   */

  clone(from) {
    let authFrom = null;

    if (from.constructor === String) {
      if (from.includes('https')) {
        authFrom = `https://${this.username}:${this.password}@${from.split('@').pop()}`;
      }

      return runCommand('clone', [authFrom, this.path])
        .then(() => this);
    }

    const uuid = '##Sddd3d22f';
    const exclude = [];

    this.init();

    return Promise.each(from, (repoURL) => {
      const repoName = repoURL.split('/').pop();

      if (from.includes('https')) {
        authFrom = `https://${this.username}:${this.password}@${repoURL.split('@').pop()}`;
      }

      return runCommand('pull', ['-f', authFrom])
        .then(() => runCommand('update', ['-tip']))
        .then(() => runCommand('rename', [repoName + uuid, `-X ${exclude}`]))
        .then(() => runCommand('commit', [`-m "Moving repository ${repoName} into folder ${repoName}`]))
        .then(() => runCommand('merge'))
        .then(() => runCommand('commit', [`-m "Committing the merge of ${repoName}`]))
        .then(() => exclude.push(repoName + uuid));
    })

    // .then(() => {
    //   //Clean up the folder names by removing the uuid
    // })
    .then(() => this);
  }
};
