import HgRepo from './HgRepo';

/*
The public facing API for various common Mercurial tasks.
*/
const Hg = {
  init: (initPath, done) => {
    const repo = new HgRepo(initPath);

    return repo.init()
      .catch(() => {})
      .asCallback(done);
  },
  // clone: (from, to, done) =>
  //   new HgRepo(to)
  //   .then(repo => repo.clone(from))
  //   .catch(() => {})
  //   .nodify(done),
  // add: (path, options, done) =>
  //   new HgRepo(path)
  //   .then(repo => repo.add(options, done)),
  // commit: (path, options, done) =>
  //   new HgRepo(path)
  //   .then(repo => repo.commit(options, done)),
  // version: done =>
  //   HgRepo.version
  //   .asCallback(done),

};

export default Hg;
