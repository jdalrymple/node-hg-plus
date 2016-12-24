const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Path = require('path');

/**
 * HgRepo
 *
 * Mercurial repository wrapper to handle all the sub functions for mecurial repositories such as:
 * init,commit,add,push,pull,rename and merge
 *
 * Also included is a function to convert hg repositories to git repositories called gitify
 *
 * @type {HgRepo}
 *
 * @params {Object} options
 * @params {String} [options.url = null],
 * @params {String} [options.username = null],
 * @params {String} [options.password = null],
 * @params {String} [options.path = null],
 * @params {String} [pythonPath = 'python']
 *
 * @return {HgRepo}
 */
module.exports = class HgRepo {
  constructor({ url = null, username = null, password = null, path = process.cwd() }, pythonPath) {
    this.path = path;
    this.username = username;
    this.password = password;
    this.url = url;
    this.name = Path.basename(path);
    this.pythonPath = pythonPath;

    Fs.ensureDirSync(this.path);
  }

  /**
   * Initialize a new repository at the provided path.
   *
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  init(done = undefined) {
    return Command.run('hg init', this.path)
      .asCallback(done);
  }

  /**
   * Hg commit
   *
   * @params  {String} message
   * @params  {Function} [done]  - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  commit(message, done = undefined) {
    if (!message) throw new Error('Commit\'s must have a message');

    return Command.run('hg commit', this.path, ['-m', `"${message}"`])
      .asCallback(done);
  }

  /**
   * Hg add
   *
   * @params {Object} options
   * @params {Array} [options.files] - Adds all non tracked files if none specified,
   * @params {String} [options.include = null],
   * @params {String} [options.exclude = null],
   * @params {Boolean} [options.subrepos = null],
   * @params {Boolean} [options.dryRun = null],
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  add(options = { files: [''], include: null, exclude: null, subrepos: false, dryRun: false }, done = undefined) {
    let optionArgs = options.files.join(' ');

    if (options.include) optionArgs += ` -I ${options.include}`;
    if (options.exclude) optionArgs += ` -X ${options.exclude}`;
    if (options.subrepos) optionArgs += ' -S';
    if (options.dryRun) optionArgs += ' -n';

    return Command.run('hg add', this.path, optionArgs)
      .asCallback(done);
  }

  push(options = { force: true, misc: '' }, done = undefined) {
    return Command.run('hg push', this.path, [options.force ? '-f' : '', options.misc])
      .asCallback(done);
  }

  pull(options, done = undefined) {
    return Command.run('hg pull', this.path, options)
      .asCallback(done);
  }

  update(options, done = undefined) {
    return Command.run('hg update', this.path, options)
      .asCallback(done);
  }

  gitify(options = { gitRepoPath: Path.dirname(this.path) }, done = undefined) {
    Command.run(`${this.pythonPath} -V`)
      .then((version) => {
        if (!version.includes(2.7)) throw new Error('Conversion library currently only supports Python 2.7.x ');

        return Command.run(`${this.pythonPath} -c "import gitifyhg"`);
      })
      .catch((error) => {
        if (!error.message.includes('ImportError')) {
          return Promise.resolve();
        }

        return Command.run(`${this.pythonPath} setup.py install', '../utils/gitifyhg`);
      })
      .then(() => Command.run(`git clone gitifyhg:${this.path} ${this.name}-git`, options.gitRepoPath))
      .asCallback(done);
  }

  rename(options, done = undefined) {
    return Command.run('hg rename', this.path, options)
      .asCallback(done);
  }

  merge(options, done = undefined) {
    return Command.run('hg merge', this.path, options)
      .asCallback(done);
  }
};
