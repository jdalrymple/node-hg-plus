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
 * @params {String} [options.url = null]
 * @params {String} [options.username = null]
 * @params {String} [options.password = null]
 * @params {String} [options.path = null]
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
  add({ files = [''], include = null, exclude = null, subrepos = false, dryRun = false }, done = undefined) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (dryRun) optionArgs.push(' -n');

    return Command.run('hg add', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Hg push
   *
   * @params {Object} options
   * @params {Boolean} [options.force = false]
   * @params {String} [options.revision = null]
   * @params {String} [options.bookmark = null]
   * @params {String} [options.branch = false]
   * @params {String} [options.ssh = null]
   * @params {Boolean} [options.insecure = false],

   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  push({ force = false, revision = null, bookmark = null, branch = null, newBranch = false, ssh = null, insecure = false }, done = undefined) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    return Command.run('hg push', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Hg pull
   *
   * @params {Object} options
   * @params {Boolean} [options.force = false]
   * @params {Boolean} [options.update = false]
   * @params {String} [options.revision = null]
   * @params {String} [options.bookmark = null]
   * @params {String} [options.branch = null],
   * @params {String} [options.ssh = null],
   * @params {Boolean} [options.insecure = null],

   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  pull({ force = false, update = false, revision = null, bookmark = null, branch = null, newBranch = false, ssh = null, insecure = false }, done = undefined) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (update) optionArgs.push(' -u');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    return Command.run('hg pull', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Hg update
   *
   * @params {Object} options
   * @params {Boolean} [options.clean = false]
   * @params {Boolean} [options.check = false]
   * @params {String} [options.revision = null]
   * @params {String} [options.tool = null],
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  update({ clean = false, check = false, revision = null, tool = null },
    done = undefined) {
    const optionArgs = [];

    if (clean) optionArgs.push(' -C');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (check) optionArgs.push(' -c');
    if (tool) optionArgs.push(` -t ${tool}`);

    return Command.run('hg update', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Create a git copy of this repository
   *
   * @param  {Object}   options
   * @param  {Object}   options.gitRepoPath - Destination path for the new git repo
   * @param  {Function} done  - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  gitify({ gitRepoPath = Path.dirname(this.path) }, done = undefined) {
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
      .then(() => Command.run(`git clone gitifyhg:${this.path} ${this.name}-git`, gitRepoPath))
      .asCallback(done);
  }

  /**
   * Hg rename
   *
   * @params {Object} options
   * @params {Boolean} [options.after = false]
   * @params {Boolean} [options.force = false]
   * @params {String} [options.include = null],
   * @params {String} [options.exclude = null],
   * @params {Boolean} [options.dryRun = null],
   * @params  {Function} [done] - Callback function
   */
  rename({ after = false, force = false, include = null, exclude = null, dryRun = false }, done = undefined) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');
    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (dryRun) optionArgs.push(' -n');

    return Command.run('hg rename', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Hg merge
   *
   * @params {Object} options
   * @params {Boolean} [options.force = false]
   * @params {String} [options.revision = null]
   * @params {Boolean} [options.preview = false]
   * @params {String} [options.tool = null]
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  merge({ force = false, revision = null, preview = false, tool = null }, done = undefined) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (preview) optionArgs.push(' -p');
    if (tool) optionArgs.push(` -t ${tool}`);

    return Command.run('hg merge', this.path, optionArgs)
      .asCallback(done);
  }
};
