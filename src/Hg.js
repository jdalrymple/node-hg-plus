const ShortID = require('shortid');
const Path = require('path');
const Tempy = require('tempy');
const Globby = require('globby');
const { URL } = require('url');
const Promise = require('bluebird');
const HgRepo = require('./HgRepo');
const Command = require('./Command');
const Utils = require('./Utils');

async function getSourceInfo(source, pythonPath) {
  let sourceRepoPath;
  let sourceRepoName;
  let sourceURL = null;

  if (source.constructor !== String && source.constructor !== Object) {
    throw new TypeError(
      'Incorrect type of from parameter. Clone source in the array is an invalid type. Must be an String or an Object',
    );
  }

  if (source.constructor === Object) sourceURL = source.url;
  else if (source.constructor === String) sourceURL = source;

  try {
    const url = new URL(sourceURL).hostname;
    const tmpDir = Tempy.directory();

    sourceRepoName = Utils.getRemoteRepoName(sourceURL);
    sourceRepoPath = Path.join(tmpDir, sourceRepoName);

    await cloneSingle(source, { path: sourceRepoPath, url: sourceURL }, pythonPath);
  } catch (error) {
    if (
      error.code !== 'ERR_INVALID_URL' &&
      !(error.message && error.message.includes('Invalid URL'))
    )
      throw error;

    sourceRepoPath = source;
    sourceRepoName = Path.basename(source);
  }

  return [sourceRepoName, sourceRepoPath];
}

async function cloneSingle(from, to, pythonPath) {
  let repo;
  let url;

  if (from.constructor === Object) {
    repo = new HgRepo(
      to || {
        url: from.url,
        password: from.password,
        username: from.username,
      },
      pythonPath,
    );

    url = Utils.buildRepoURL(from);
  } else {
    repo = new HgRepo(
      to || {
        url: from,
      },
      pythonPath,
    );
    url = from;
  }

  await Utils.ensureRepoPath(repo.path);
  await Command.run('hg clone', repo.path, [url, repo.path]);

  return repo;
}

async function cloneMultipleAndMerge(from, to, pythonPath) {
  const mergedRepos = [];
  const combinedRepo = new HgRepo(to, pythonPath);

  await Utils.ensureRepoPath(combinedRepo.path);
  await combinedRepo.init();

  await Promise.each(from, async repo => {
    const [repoName, repoPath] = await getSourceInfo(repo, pythonPath);
    let repoDir = repoName;

    if (mergedRepos.includes(repoName)) {
      repoDir += `-${ShortID.generate()}`;
    }

    await combinedRepo.pull({ source: repoPath, force: true });
    await combinedRepo.update({ clean: true, revision: 'default' });

    const files = await Globby(['*', '!.hg'], {
      expandDirectories: true,
      dot: true,
      cwd: combinedRepo.path,
    });
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
      if (
        !error.message.includes('nothing to merge') &&
        !error.message.includes('merging with a working directory ancestor')
      ) {
        throw error;
      }
    }
  });

  return combinedRepo;
}

class Hg {
  constructor({ path = 'python' } = {}) {
    this.pythonPath = path;
  }

  async clone(from, to, done) {
    let repo;
    let error = null;

    try {
      switch (from.constructor) {
        case Array:
          repo = await cloneMultipleAndMerge(from, to, this.pythonPath);
          break;
        case String:
        case Object:
          repo = await cloneSingle(from, to, this.pythonPath);
          break;
        default:
          return new TypeError('Incorrect type of from parameter. Must be an array or an object');
      }
    } catch (e) {
      error = e;
    }

    return Utils.asCallback(error, repo, done);
  }

  async create(to, done) {
    let repo;
    let error = null;

    try {
      repo = new HgRepo(to, this.pythonPath);

      await Utils.ensureRepoPath(repo.path);
      await repo.init();
    } catch (e) {
      error = e;
    }

    return Utils.asCallback(error, repo, done);
  }

  async getRepo({ path = process.cwd(), username, password } = {}) {
    await Utils.checkForHGFolder(path);

    const repo = new HgRepo({ path, username, password }, this.pythonPath);
    const paths = await repo.paths();
    repo.url = paths.default;

    return repo;
  }

  async gitify({ path, trackAll, remoteURL } = {}, done) {
    const repo = await this.getRepo();

    return repo.gitify({ path, trackAll, remoteURL }, done);
  }

  async identify(remoteUrl, done) {
    return this.constructor.identify(remoteUrl, done);
  }

  async version(done) {
    return this.constructor.version(done);
  }

  static async version(done) {
    return Command.runWithHandling('hg --version', undefined, undefined, done);
  }

  static async identify(remoteUrl, done) {
    return Command.runWithHandling(`hg identify ${remoteUrl}`, undefined, undefined, done);
  }
}

module.exports = Hg;
