const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');
const Globby = require('globby');

const HgRepo = require('./HgRepo');
const Command = require('./Command');
const Utils = require('./Utils');

function moveFiles(source, destination, files) {
  const movePromises = files.map((file) => {
    const sourcePath = Path.join(source, file);
    const destinationPath = Path.join(destination, file);

    return Fs.moveAsync(sourcePath, destinationPath);
  });

  return Promise.all(movePromises);
}

async function cloneMultipleAndMerge(fromRepos, combinedRepo) {
  const mergedRepos = [];

  for (let fromRepo of fromRepos) {
    if (fromRepo.constructor !== String || fromRepo.constructor !== Object) {
      throw new TypeError('Incorrect type of from parameter. Clone source in array is an invalid type. Must be an String or an Object');
    }

    let name = Path.basename(fromRepo);

    if (mergedRepos.includes(name)) {
      name += `-${ShortID.generate()}`;
    }

    await combinedRepo.pull({ source: fromRepo, force: true });
    await combinedRepo.update({ clean: true, revision: 'default' });

    const files = await Globby(['*', '!.hg'], { dot: true, cwd: combinedRepo.path });

    await moveFiles(combinedRepo.path, Path.join(combinedRepo.path, name), files);
    await combinedRepo.add();

    try {
      await combinedRepo.remove({ after: true });
    } catch (errorInfo) {
      if (!errorInfo.error.message.includes('still exists')) throw errorInfo.error;
    }

    await combinedRepo.commit(`Moving repository ${name} into folder ${name}`);

    if (!mergedRepos.length) break;

    await combinedRepo.merge();

    try {
      await combinedRepo.commit(`Merging ${name} into combined`);
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

async function cloneSingle(from, to, pythonPath) {
  let repo;
  let url;

  if (from.constructor === Object) {
    repo = new HgRepo(to || {
      url: from.url,
      password: from.password,
      username: from.username,
    }, pythonPath);

    url = Utils.buildRepoURL(from);
  } else {
    url = from;
    repo = new HgRepo(to || {
      url: from,
    }, pythonPath);
  }

  await Command.run('hg clone', repo.path, [url, repo.path]);

  return repo;
}

class Hg {
  constructor(path = 'python') {
    this.pythonPath = path;
  }

  async clone(from, to = undefined, done = undefined) {
    let repo;

    try {
      switch (from.constructor) {
        case Array:
          {
            repo = await cloneMultipleAndMerge(from, to);
            break;
          }
        case String || Object:
          repo = await cloneSingle(from, to, this.pythonPath);
          break;
        default:
          return new TypeError('Incorrect type of from parameter. Must be an array or an object');
      }
    } catch (e) {
      if (e.message.includes('not found')) {
        throw new TypeError('Incorrect type of from parameter. Clone source not found');
      } else {
        throw e;
      }
    }

    return Utils.asCallback(repo, done);
  }

  async create(to, done = undefined) {
    const repo = new HgRepo(to, this.pythonPath);

    await repo.init();

    return Utils.asCallback(repo, done);
  }

  async gitify({ gitRepoPath = undefined } = {}, done = undefined) {
    const repo = new HgRepo(undefined, this.pythonPath);

    await repo.gitify({ gitRepoPath });

    return Utils.asCallback(null, done);
  }

  version(done = undefined) {
    return this.constructor.version(done);
  }

  static async version(done = undefined) {
    const output = await Command.run('hg --version');

    return Utils.asCallback(output, done);
  }
}

module.exports = Hg;
