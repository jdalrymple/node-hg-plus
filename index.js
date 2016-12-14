const Promise = require('bluebird');
const ShortID = require('shortid');
const Fs = require('fs-extra-promise');
const Path = require('path');

const HgRepo = require('./HgRepo');
const Command = require('./utils/Command');

function mergeRepositories(fromRepo, combinedRepo) {
  const uuid = `-${ShortID.generate()}`;
  const repoName = fromRepo.url.split('/').pop();
  let repoDirectory = repoName;
  let authFrom;

  if (fromRepo.url.includes('ssh')) throw new Error('SSHNotSupported');
  if (fromRepo.url.includes('https')) {
    authFrom = `https://${fromRepo.username}:${fromRepo.password}@${fromRepo.url.split('@').pop()}`;
  } else {
    authFrom = fromRepo.url;
  }

  return combinedRepo.pull(['-f', authFrom])
    .then(() => combinedRepo.update(['-C', 'tip']))
    .then(() => Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory)))
    .catch(() => {
      repoDirectory += uuid;
      Fs.ensureDirAsync(Path.resolve(combinedRepo.path, repoDirectory));
    })
    .then(() => combinedRepo.rename(['*', repoDirectory]))
    .then(() => combinedRepo.commit(`Moving repository ${repoName} into folder ${repoName}`))
    .then(() => combinedRepo.merge)
    .then(() => combinedRepo.commit(`Merging ${repoName} into combined`))
    .catch((error) => {
      if (!error.message.includes('nothing to merge')) throw error;
    });
}

function cloneOrMergeMany(from, to) {
  const newRepo = new HgRepo(to);
  let authFrom = null;

  if (typeof from === 'object' && !Array.isArray(from)) {
    authFrom = `https://${from.username}:${from.password}@${from.url.split('@').pop()}`;

    return Command.run('clone', newRepo.path, [authFrom])
      .then(() => newRepo);
  } else if (Array.isArray(from)) {
    return newRepo.init()
      .then(() => Promise.each(from, fromRepo => mergeRepositories(fromRepo, newRepo)))
      .then(() => newRepo);
  } else {
    throw new TypeError('Incorrect type of from parameter. Must be an array or object');
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
      .then(output => console.log(output))
      .asCallback(done);
  },
};

module.exports = Hg;
