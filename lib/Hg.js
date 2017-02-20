const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');
const Globby = require('globby');

const HgRepo = require('./HgRepo');
const Command = require('../utils/Command');


function moveFiles(source, destination, files) {
  const movePromises = files.map((file) => {
    const sourcePath = Path.join(source, file);
    const destinationPath = Path.join(destination, file);

    return Fs.moveAsync(sourcePath, destinationPath);
  });

  return Promise.all(movePromises);
}

function cloneMultipleAndMerge(fromRepos, combinedRepo) {
  const mergedRepos = [];

  return Promise.each(fromRepos, (fromRepo) => {
    if (fromRepo.constructor !== String) {
      throw new TypeError('Incorrect type of from parameter. Clone source in array is an invalid type. Must be an Object');
    }

    let name = Path.basename(fromRepo);

    if (mergedRepos.includes(name)) {
      name += `-${ShortID.generate()}`;
    }

    return combinedRepo.pull({ source: fromRepo, force: true })
      .then(() => combinedRepo.update({ clean: true, revision: 'default' }))
      .then(() => Globby(['*', '!.hg'], { dot: true, cwd: combinedRepo.path }))
      .then(files => moveFiles(combinedRepo.path, Path.join(combinedRepo.path, name), files))
      .then(() => combinedRepo.add())
      .then(() => combinedRepo.remove({ after: true }))
      .catch((errorInfo) => {
        if (!errorInfo.error.message.includes('still exists')) throw errorInfo.error;
      })
      .then(() => combinedRepo.commit(`Moving repository ${name} into folder ${name}`))
      .then(() => {
        if (!mergedRepos.length) return Promise.resolve();

        return combinedRepo.merge()
          .then(() => combinedRepo.commit(`Merging ${name} into combined`))
          .catch((errorInfo) => {
            if (!errorInfo.error.message.includes('nothing to merge') &&
              !errorInfo.error.message.includes('merging with a working directory ancestor')) {
              throw errorInfo.error;
            }
          });
      })
      .then(() => {
        mergedRepos.push(name);
      });
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

  create(to, done = undefined) {
    const repo = new HgRepo(to, this.pythonPath);

    return repo.init()
    .then(() => repo)
    .asCallback(done);
  }

  gitify({ gitRepoPath = undefined } = {}, done = undefined) {
    const repo = new HgRepo(undefined, this.pythonPath);

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
