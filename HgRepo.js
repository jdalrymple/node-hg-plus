const Exec = require('child_process').exec;
const Promise = require('bluebird');
const Fs = require('fs-extra-promise');
const ShortID = require('shortid');
const Path = require('path');

function runCommand(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `hg ${command} ${options.join(' ')}`

    Exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }

      resolve();
    })
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
    return runCommand('init', this.path)
      .then(() => this);
  }


  clone(from) {
    let authFrom = null;

    if (from.constructor === String) {
      if (from.includes('https')) {
        authFrom = `https://${this.username}:${this.password}@${from.split('@').pop()}`;
      }

      return runCommand('clone', this.path, [authFrom])
        .then(() => this);
    } else {
      return this.init()
        .then(() => {
          return Promise.each(from, (repoURL) => {
            const uuid = `-${ShortID.generate()}`;
            const repoName = repoURL.split('/').pop();
            const repoDirectory = repoName

            if (repoURL.includes('https')) {
              authFrom = `https://${this.username}:${this.password}@${repoURL.split('@').pop()}`;
            }

            return runCommand('pull', this.path, ['-f', authFrom])
              .then(() => runCommand('update', this.path, ['-C','tip']))
              .then(() => Fs.ensureDirAsync(Path.resolve(this.path, repoDirectory)))
              .catch((error)=>{
                repoDirectory += uuid;
                Fs.ensureDirAsync(Path.resolve(this.path, repoDirectory))
              })
              .then(() => runCommand('rename', this.path, ['*', repoDirectory]))
              .then(() => runCommand('commit', this.path, [`-m "Moving repository ${repoName} into folder ${repoName}"`]))
              .then(() => runCommand('merge', this.path))
              .then(() => runCommand('commit', this.path, [`-m "Merging ${repoName} into combined"`]))
              .catch((error) => {
                if (!error.message.includes("nothing to merge")) throw error;
              })
          })
        })
        .then(() => this)
    }
  }
};
