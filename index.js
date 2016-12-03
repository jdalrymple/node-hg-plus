import HgRepo from './lib/HgRepo';

/*
The public facing API for various common Mercurial tasks.
*/
class Hg {
  static init(initPath, done) {
    return new HgRepo(initPath)
      .then(repo => repo.init())
      .catch(() => {})
      .nodeify(done);
  }

  static clone(from, to, done) {
    return new HgRepo(to)
      .then(repo => repo.clone(from))
      .catch(() => {})
      .nodify(done);
  }

  static add(path, options, done) {
    const repo = new HGRepo(path);

    return repo.add(options, done);
  }

  static commit(path, options, done) {
    const repo = new HGRepo(path);

    return repo.commit(options, done);
  }

  static version(done) {
    const repo = new HGRepo(null);

    return repo.version(done);
  }
}

const API = new Hg();
export default API;
