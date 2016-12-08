const HgRepo = require('./HgRepo');

/*
The public facing API for various common Mercurial tasks.
*/
class Hg {
  constructor(credentials) {
    this.credentials = credentials;
  }

  init(to = undefined, done = undefined) {
    const repo = new HgRepo(this.credentials, to);

    return repo.init()
      .catch((error) => {
        console.log(error)
      })
      .asCallback(done);
  }

  clone(from, to = undefined, done = undefined) {
    let cloneDir = to;

    if (to === undefined) {
      if (from.constructor === Array) {
        throw new Error('Must specify a destination path');
      } else {
        cloneDir = from.split('/').pop();
      }
    }

    const repo = new HgRepo(this.credentials, cloneDir);

    return repo.clone(from)
      .catch((error) => {
        console.log(error)
      })
      .asCallback(done);
  }

  // add(path, options, done) {
  //     const repo = new HgRepo(this.credentials, path);

  //     return repo.add(options, done)
  //   }
  // commit: (path, options, done) =>
  //   new HgRepo(path)
  //   .then(repo => repo.commit(options, done)),
  // version: done =>
  //   HgRepo.version
  //   .asCallback(done),

}

module.exports = credentials => new Hg(credentials);
