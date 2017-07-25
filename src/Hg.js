const ShortID = require('shortid');
const Path = require('path');
const Tempy = require('tempy');
const Globby = require('globby');
const HgRepo = require('./HgRepo');
const Command = require('./Command');
const Utils = require('./Utils');
const { URL } = require('url');
const Promise = require('bluebird');

async function getSourceInfo(source) {
  let sourceRepoPath;
  let sourceRepoName;
  let sourceURL = null;
  let tmpRepo = null;

  if (source.constructor !== String && source.constructor !== Object) {
    throw new TypeError('Incorrect type of from parameter. Clone source in the array is an invalid type. Must be an String or an Object');
  }

  if (source.constructor === Object) sourceURL = source.url;
  else if (source.constructor === String) sourceURL = source;

  try {
    const url = new URL(sourceURL).hostname;
    const tmpDir = Tempy.directory();

    tmpRepo = await cloneSingle(source, { path: tmpDir, url: sourceURL });

    sourceRepoPath = tmpRepo.path;
    sourceRepoName = tmpRepo.name;
  } catch (error) {
    sourceRepoPath = source;
    sourceRepoName = Path.basename(source);
  }

  return [sourceRepoName, sourceRepoPath];
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
    repo = new HgRepo(to || {
      url: from,
    }, pythonPath);
    url = from;
  }

  await Command.run('hg clone', repo.path, [url, repo.path]);

  return repo;
}

async function cloneMultipleAndMerge(from, to) {
  const mergedRepos = [];
  const combinedRepo = new HgRepo(to);

  await combinedRepo.init();

  await Promise.each(from, async (repo) => {
    const [repoName, repoPath] = await getSourceInfo(repo);
    let repoDir = repoName;

    if (mergedRepos.includes(repoName)) {
      repoDir += `-${ShortID.generate()}`;
    }

    await combinedRepo.pull({ source: repoPath, force: true });
    await combinedRepo.update({ clean: true, revision: 'default' });

    const files = await Globby(['*', '!.hg'], { dot: true, cwd: combinedRepo.path });
    const subDirectory = Path.join(combinedRepo.path, repoDir);

    await Utils.moveFiles(combinedRepo.path, subDirectory, files);
    await combinedRepo.add();

    try {
      await combinedRepo.remove({ after: true });
    } catch (error) {
      if (!error.message.includes('still exists')) throw error;
    }

    await combinedRepo.commit(`Moving repository ${repoName} into folder ${subDirectory}`);

    mergedRepos.push(repoDir);

    if (mergedRepos.length === 1) return;

    await combinedRepo.merge();

    try {
      await combinedRepo.commit(`Merging ${repoName} into combined`);
    } catch (error) {
      if (!error.message.includes('nothing to merge') &&
        !error.message.includes('merging with a working directory ancestor')) {
        throw error;
      }
    }
  });

  return combinedRepo;
}

class Hg {
  constructor({ path = 'python' } = { path: 'python' }) {
    this.pythonPath = path;
  }

  async clone(from, to, done) {
    let repo;

    try {
      switch (from.constructor) {
        case Array: {
          repo = await cloneMultipleAndMerge(from, to);
          break;
        }
        case String:
        case Object:
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

  async create(to, done) {
    const repo = new HgRepo(to, this.pythonPath);

    await repo.init();

    return Utils.asCallback(repo, done);
  }

  async gitify({ gitRepoPath } = {}, done) {
    const repo = new HgRepo({ name: ' ' }, this.pythonPath);

    await repo.gitify(gitRepoPath);

    return Utils.asCallback(null, done);
  }

  version(done) {
    return this.constructor.version(done);
  }

  static async version(done) {
    const output = await Command.run('hg --version');

    return Utils.asCallback(output.stdout, done);
  }
}

module.exports = Hg;
