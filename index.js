import HGRepo from './lib/HGRepo';

/*
The public facing API for various common Mercurial tasks.
*/
class Hg {
  static init(initPath, options, done) {
    return HGRepo.MakeTempRepo()
      .then(repo => repo.init(initPath, done))
      .catch(() => {})
      .nodeify(done);
  }

  static clone(from, to, options, done) {
    return HGRepo.MakeTempRepo()
      .then(repo => repo.clone(from, to, options, done))
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

  static summary(path, options, done) {
    const repo = new HGRepo(path);

    return repo.summary(options, done);
  }

  static log(path, options, done) {
    const repo = new HGRepo(path);

    return repo.log(options, done);
  }

  static version(done) {
    const repo = new HGRepo(null);

    return repo.version(done);
  }
}

const API = new Hg();
export default API;
