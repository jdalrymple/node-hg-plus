const HgRepo = require('./HgRepo');
const Command = require('utils/Command');

/*
The public facing API for various common Mercurial tasks.
*/
class Hg {
  constructor(credentials) {
    this.credentials = credentials;
  }

  init(to = undefined, done = undefined) {
    const repo = new HgRepo(credentials, to);

    return repo.init()
      .catch((error) => {
        console.log(error)
      })
      .asCallback(done);
  }

  clone(from, to = undefined, options, done = undefined) {
    const credentials = options.credentials || this.credentials
    let cloneDir = to;

    if (to === undefined) {
      if (from.constructor === Array) {
        throw new Error('Must specify a destination path');
      } else {
        cloneDir = from.split('/').pop();
      }
    }

    const repo = new HgRepo(credentials, cloneDir);

    return repo.clone(from)
      .catch((error) => {
        console.log(error)
      })
      .asCallback(done);
  }

  commit(message, done = undefined) {
    return new HgRepo()
      .then(repo => repo.commit(message, done));
  }

  add(options, done = undefined) {
    return new HgRepo()
      .then(repo => repo.add(options, done));
  }

  push(options, done = undefined) {
    return new HgRepo()
      .then(repo => repo.push(options, done));
  }

  pull(options, done = undefined) {
    return new HgRepo()
      .then(repo => repo.pull(options, done));
  }

  version(done = undefined) {
    Command.run('--version')
      .asCallback(done);
  }
}


module.exports = credentials => new Hg(credentials);
