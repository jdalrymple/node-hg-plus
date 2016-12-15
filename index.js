const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');

const HgRepo = require('./HgRepo');
const Command = require('./utils/Command');

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

  return combinedRepo.pull(['-f', authFrom])
    .then(() => combinedRepo.update(['-C', 'tip']))
    .then(() => Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory)))
    .catch(() => {
      repoDirectory += uuid;
      Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory));
    })
    .then(() => combinedRepo.rename(['*', repoDirectory]))
    .then(() => combinedRepo.commit(`Moving repository ${repoName} into folder ${repoName}`))
    .then(() => combinedRepo.merge())
    .then(() => combinedRepo.commit(`Merging ${repoName} into combined`))
    .catch((results) => {
      if (!results.error.message.includes('nothing to merge')) throw results.error;
    });
}

function cloneOrMergeMany(from, to) {
  const newRepo = new HgRepo(to);

  if (typeof from === 'object' && !Array.isArray(from)) {
    const authFrom = getAuthenticatedURL(from);

    return Command.run('clone', authFrom, [authFrom, newRepo.path])
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
const Hg = {
  /**
   * Cloning
   * @param  {Array<Object>| Object}   from [description]
   * @param  {url:String, user:String, pass:String, path:String}   to   [description]
   * @param  {Function} done [description]
   * @return {[type]}        [description]
   */
  clone(from, to = undefined, done = undefined) {
    return cloneOrMergeMany(from, to)
      .asCallback(done);
  },

  create(to = undefined, done = undefined) {
    const newRepo = new HgRepo(to);

    return newRepo.init()
      .then(() => newRepo)
      .asCallback(done);
  },

  version(done = undefined) {
    return Command.run('--version')
      .then((output) => {
        console.log(output);
        return output;
      })
      .asCallback(done);
  },
};

module.exports = Hg;
