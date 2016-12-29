'use-strict';

const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');

const HgRepo = require('./HgRepo');
const Command = require('../utils/Command');

function getAuthenticatedURL(repoInfo) {
  let authURL;

  if (repoInfo.url.includes('ssh')) throw new Error('SSHNotSupported');
  if (repoInfo.url.includes('https')) {
    authURL = `https://${repoInfo.username}:${repoInfo.password}@${repoInfo.url.split('@').pop()}`;
  } else {
    authURL = repoInfo.url;
  }

  return authURL;
}

function mergeRepositories(fromRepo, combinedRepo) {
  const uuid = `-${ShortID.generate()}`;
  const repoName = Path.basename(fromRepo.url);
  const authFrom = getAuthenticatedURL(fromRepo);
  let repoDirectory = repoName;

  return combinedRepo.pull({ source: authFrom, force: true })
    .then(() => combinedRepo.update({ clean: true, revision: 'tip' }))
    .then(() => Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory)))
    .catch(() => {
      repoDirectory += uuid;
      Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory));
    })
    .then(() => combinedRepo.rename('*', repoDirectory))
    .then(() => combinedRepo.commit(`Moving repository ${repoName} into folder ${repoName}`))
    .then(() => combinedRepo.merge())
    .then(() => combinedRepo.commit(`Merging ${repoName} into combined`))
    .catch((results) => {
      if (!results.error.message.includes('nothing to merge')) throw results.error;
    });
}

function cloneOrMergeMany(from, to, pythonPath) {
  const newRepo = new HgRepo(to, pythonPath);

  if (typeof from === 'object' && !Array.isArray(from)) {
    const authFrom = getAuthenticatedURL(from);

    return Command.run('hg clone', authFrom, [authFrom, newRepo.path])
      .then(() => newRepo);
  } else if (!Array.isArray(from)) {
    throw new TypeError('Incorrect type of from parameter. Must be an array or object');
  } else {
    return newRepo.init()
      .then(() => Promise.each(from, fromRepo => mergeRepositories(fromRepo, newRepo)))
      .then(() => newRepo);
  }
}

/*
The public facing API for various common Mercurial tasks.
*/
class Hg {
  constructor({ pythonPath = 'python' }) {
    this.pythonPath = pythonPath;
  }

  /**
   * Hg clone
   *
   * @params {Object} from
   * @params {String} [from.url = null]
   * @params {String} [from.username = null]
   * @params {String} [from.password = null]
   * @params {String} [from.path = null]
   * @params {Object} [to = undefined]
   * @params {String} [to.url = null]
   * @params {String} [to.username = null]
   * @params {String} [to.password = null]
   * @params {String} [to.path = null]
   * @params  {Function} [done] - Callback function
   *
   * @return {HgRepo}
   */
  clone(from, to = undefined, done = undefined) {
    return cloneOrMergeMany(from, to, this.pythonPath)
      .asCallback(done);
  }

  /**
   * Creates a new Hg repo
   *
   * @params {Object} [to = undefined]
   * @params {String} [to.url = null]
   * @params {String} [to.username = null]
   * @params {String} [to.password = null]
   * @params {String} [to.path = process.cwd()]
   * @params  {Function} [done] - Callback function
   *
   * @return {HgRepo}
   */
  create(to = undefined, done = undefined) {
    const newRepo = new HgRepo(to, this.pythonPath);

    return newRepo.init()
      .then(() => newRepo)
      .asCallback(done);
  }

  /**
   * Create a git copy of this repository
   *
   * @param  {Object}   [options]
   * @param  {Object}   [options.gitRepoPath] - Destination path for the new git repo
   * @param  {Function} [done]  - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  gitify({ gitRepoPath = Path.dirname(this.path) }, done = undefined) {
    const repo = new HgRepo({}, this.pythonPath);

    return repo.gitify({ gitRepoPath })
      .asCallback(done);
  }

  /**
   * Hg version
   *
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  version(done = undefined) {
    return this.constructor.version(done);
  }

  static version(done = undefined) {
    return Command.run('hg --version')
      .asCallback(done);
  }
}


module.exports = Hg;
