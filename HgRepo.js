const Promise = require('bluebird');
const Fs = require('fs-extra-promise');
const ShortID = require('shortid');
const Path = require('path');
const Command = require('utils/Command');

module.exports = class HgRepo {
  /*
  Create a HgRepo with a root path defined by the passed in `@path`
  (defaults to `process.cwd()`)
  */
  constructor(credentials = { username: null, password: null }, path = process.cwd()) {
    this.path = path;
    this.username = credentials.username;
    this.password = credentials.password;

    Fs.ensureDir(path);
  }

  /*
  Initialize a new repository at the provided path.
  */
  init() {
    return Command.run('init', this.path)
      .then(() => this);
  }

  clone(from) {
    let authFrom = null;

    if (from.constructor === String) {
      if (from.includes('https')) {
        authFrom = `https://${this.username}:${this.password}@${from.split('@').pop()}`;
      }

      return Command.run('clone', this.path, [authFrom])
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

            return Command.run('pull', this.path, ['-f', authFrom])
              .then(() => Command.run('update', this.path, ['-C', 'tip']))
              .then(() => Fs.ensureDirAsync(Path.resolve(this.path, repoDirectory)))
              .catch((error) => {
                repoDirectory += uuid;
                Fs.ensureDirAsync(Path.resolve(this.path, repoDirectory))
              })
              .then(() => Command.run('rename', this.path, ['*', repoDirectory]))
              .then(() => Command.run('commit', this.path, [`-m "Moving repository ${repoName} into folder ${repoName}"`]))
              .then(() => Command.run('merge', this.path))
              .then(() => Command.run('commit', this.path, [`-m "Merging ${repoName} into combined"`]))
              .catch((error) => {
                if (!error.message.includes("nothing to merge")) throw error;
              })
          })
        })
        .then(() => this)
    }
  }

  commit(message, done = undefined) {
    Command.run('commit', this.path, ['-m', message])
      .asCallback(done)
  }

  add(options, done = undefined) {
    Command.run('add', this.path, options)
      .asCallback(done)
  }

  push(options, done = undefined) {
    Command.run('push', this.path, options)
      .asCallback(done)
  }

  pull(options, done = undefined) {
    Command.run('pull', this.path, options)
      .asCallback(done)
  }
};
