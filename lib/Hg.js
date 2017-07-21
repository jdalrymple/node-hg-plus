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

  for (repo of fromRepos) {
    if (fromRepo.constructor !== String || fromRepo.constructor !== Object) {
      throw new TypeError('Incorrect type of from parameter. Clone source in array is an invalid type. Must be an String or an Object');
    }

    let name = Path.basename(fromRepo);

    if (mergedRepos.includes(name)) {
      name += `-${ShortID.generate()}`;
    }

    await combinedRepo.pull({ source: fromRepo, force: true })
    await combinedRepo.update({ clean: true, revision: 'default' })

    let files = await Globby(['*', '!.hg'], { dot: true, cwd: combinedRepo.path })

    await moveFiles(combinedRepo.path, Path.join(combinedRepo.path, name), files)
    await combinedRepo.add()
    try {
      await combinedRepo.remove({ after: true })
    } catch (errorInfo) {
      if (!errorInfo.error.message.includes('still exists')) throw errorInfo.error;
    }

    await combinedRepo.commit(`Moving repository ${name} into folder ${name}`)

    if (!mergedRepos.length) return;

    await combinedRepo.merge()
    try {
      await combinedRepo.commit(`Merging ${name} into combined`)

    } catch (errorInfo) {
      if (!errorInfo.error.message.includes('nothing to merge') &&
        !errorInfo.error.message.includes('merging with a working directory ancestor')) {
        throw errorInfo.error;
      }
    }

    mergedRepos.push(name);
  }

  return combinedRepo;
}

async function cloneSingleOrMultiple(from, to, pythonPath) {
  const newRepo = new HgRepo(to, pythonPath);

  switch (from.constructor) {
    case String:
      try {
        await Command.run('hg clone', newRepo.path, [from, newRepo.path])
      } catch (error) {
        if (results.error.message.includes('not found')) {
          throw new TypeError('Incorrect type of from parameter. Clone source not found');
        }
      }

      return newRepo;
    case Object:
      let url;

      if (from.password && from.username) {
        url = `https://${from.username}:${from.password}@${from.url.split('@').pop()}`;
      } else {
        url = from.url;
      }

      try {
        await Command.run('hg clone', newRepo.path, [url, newRepo.path])
      } catch (error) {
        if (error.error.message.includes('not found')) {
          throw new TypeError('Incorrect type of from parameter. Clone source not found');
        }
      }

      return newRepo;
    case Array:
      return newRepo.init()
        .then(() => cloneMultipleAndMerge(from, newRepo));
    default:
      return Promise.reject(new TypeError('Incorrect type of from parameter. Must be an array or an object'));
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