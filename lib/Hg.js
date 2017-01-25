const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');

const HgRepo = require('./HgRepo');
const Command = require('../utils/Command');

function mergeRepositories(repoName, fromRepoURL, combinedRepo) {
  return combinedRepo.pull({ source: fromRepoURL, force: true })
    .then(() => combinedRepo.update({ clean: true, revision: 'default' }))
    .then(() => Fs.mkdirsAsync(Path.resolve(combinedRepo.path, repoName)))
    .then(() => combinedRepo.rename('*', repoName))
    .then(() => combinedRepo.commit(`Moving repository ${repoName} into folder ${repoName}`))
    .then(() => combinedRepo.merge({ revision: 'default' }))
    .then(() => combinedRepo.commit(`Merging ${repoName} into combined`))
    .catch((results) => {
      if (!results.error.message.includes('nothing to merge')) throw results.error;
    });
}

function cloneMultipleAndMerge(fromRepos, combinedRepo) {
  const mergedRepos = [];

  return Promise.each(fromRepos, (fromRepo) => {
    if (fromRepo.constructor !== String) {
      throw new TypeError('Incorrect type of from parameter. Clone source in array is an invalid type. Must be an Object');
    }

    const uuid = `-${ShortID.generate()}`;
    let name = Path.basename(fromRepo);

    if (mergedRepos.includes(name)) {
      name += uuid;
    }

    mergedRepos.push(name);

    return mergeRepositories(name, fromRepo, combinedRepo);
  })
  .then(() => combinedRepo);
}

function cloneSingleOrMultiple(from, to, pythonPath) {
  const newRepo = new HgRepo(to, pythonPath);

  switch (from.constructor) {
    case String:
      {
        return Command.run('hg clone', newRepo.path, [from, newRepo.path])
          .then(() => newRepo)
          .catch((results) => {
            if (results.error.message.includes('not found')) {
              throw new TypeError('Incorrect type of from parameter. Clone source not found');
            }
          });
      }

    case Array:
      {
        return newRepo.init()
          .then(() => cloneMultipleAndMerge(from, newRepo));
      }

    default:
      {
        return Promise.reject(new TypeError('Incorrect type of from parameter. Must be an array or an object'));
      }
  }
}

class Hg {
  constructor() {
    this.pythonPath = null;
  }

  setPythonPath(path = 'python') {
    this.pythonPath = path;
  }

  clone(from, to = undefined, done = undefined) {
    return cloneSingleOrMultiple(from, to, this.pythonPath)
      .asCallback(done);
  }

  create(to = undefined, done = undefined) {
    const newRepo = new HgRepo(to, this.pythonPath);

    return newRepo.init()
      .asCallback(done);
  }

  gitify({ gitRepoPath = Path.dirname(this.path) }, done = undefined) {
    const repo = new HgRepo({}, this.pythonPath);

    return repo.gitify({ gitRepoPath })
      .asCallback(done);
  }

  version(done = undefined) {
    return this.constructor.version(done);
  }

  static version(done = undefined) {
    return Command.run('hg --version')
      .then(output => Promise.resolve(output.stdout))
      .asCallback(done);
  }
}


module.exports = Hg;
