const Promise = require('bluebird');
const Fs = require('fs-extra-promise');
const Path = require('path');
const Command = require('./utils/Command');

module.exports = class HgRepo {
  constructor(to = { url: null, username: null, password: null, path: process.cwd() }) {
    this.path = to.path;
    this.username = to.username;
    this.password = to.password;
    this.url = to.url;

    Fs.ensureDir(this.path);
  }

  /**
   * Initialize a new repository at the provided path.
   * 
   * @param  {url:String, user:String, pass:String, path:String}   to   [description]
   * @param  {Function} done [description]
   * 
   * @return {[type]}        [description]
   */
  init(done = undefined) {
    return Command.run('init', this.path)
      .catch((error) => {
        console.log(error)
      })
      .asCallback(done);
  }

  commit(message, done = undefined) {
    Command.run('commit', this.path, ['-m', message])
      .asCallback(done)
  }

  add(options, done = undefined) {
    Command.run('add', this.path, options)
      .asCallback(done)
  }

  push(options, done = undefined) {
    Command.run('push', this.path, options)
      .asCallback(done)
  }

  pull(options, done = undefined) {
    Command.run('pull', this.path, options)
      .asCallback(done)
  }
};
