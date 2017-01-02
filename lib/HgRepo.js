const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Path = require('path');

function ensureGitify(pythonPath) {
  return Command.run(`${pythonPath} -c 'import gitifyhg'`)
    .catch((output) => {
      if (output.error.message.includes('ImportError')) {
        throw new ReferenceError(`Must install gitifyhg. Run this command: ${pythonPath} ${Path.resolve('utils', 'gitifyhg', 'setup.py')} install`);
      }
    });
}

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
  constructor(options = { url: null, username: null, password: null, path: process.cwd() }, pythonPath = 'python') {
    this.path = options.path;
    this.username = options.username;
    this.password = options.password;
    this.url = options.url;
    this.name = Path.basename(options.path);
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
    const optionArgs = [];

    optionArgs.push(options.files.join(' '));

    if (options.include) optionArgs.push(` -I ${options.include}`);
    if (options.exclude) optionArgs.push(` -X ${options.exclude}`);
    if (options.subrepos) optionArgs.push(' -S');
    if (options.dryRun) optionArgs.push(' -n');

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
   * @params {Boolean} [options.insecure = false]
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  push(
    options = {
      force: false,
      revision: null,
      bookmark: null,
      branch: null,
      newBranch: false,
      ssh: null,
      insecure: false,
    },
    done = undefined) {
    const optionArgs = [];

    if (options.force) optionArgs.push(' -f');
    if (options.revision) optionArgs.push(` -r ${options.revision}`);
    if (options.bookmark) optionArgs.push(` -B ${options.bookmark}`);
    if (options.branch) optionArgs.push(` -b ${options.branch}`);
    if (options.newBranch) optionArgs.push(' --new-branch');
    if (options.ssh) optionArgs.push(` -e ${options.ssh}`);
    if (options.insecure) optionArgs.push(' --insecure');

    return Command.run('hg push', this.path, optionArgs)
      .asCallback(done);
  }

  /**
   * Hg pull
   *
   * @params {Object} options
   * @params {String} [options.source = this.url]
   * @params {Boolean} [options.force = false]
   * @params {Boolean} [options.update = false]
   * @params {String} [options.revision = null]
   * @params {String} [options.bookmark = null]
   * @params {String} [options.branch = null]
   * @params {String} [options.ssh = null]
   * @params {Boolean} [options.insecure = null]
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  pull(
    options = {
      source: this.url,
      force: false,
      update: false,
      revision: null,
      bookmark: null,
      branch: null,
      newBranch: false,
      ssh: null,
      insecure: false,
    },
    done = undefined) {
    const optionArgs = [];

    optionArgs.push(options.source);

    if (options.force) optionArgs.push(' -f');
    if (options.update) optionArgs.push(' -u');
    if (options.revision) optionArgs.push(` -r ${options.revision}`);
    if (options.bookmark) optionArgs.push(` -B ${options.bookmark}`);
    if (options.branch) optionArgs.push(` -b ${options.branch}`);
    if (options.newBranch) optionArgs.push(' --new-branch');
    if (options.ssh) optionArgs.push(` -e ${options.ssh}`);
    if (options.insecure) optionArgs.push(' --insecure');

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
   * @params {String} [options.tool = null]
   * @params  {Function} [done] - Callback function
   *
   * @return {Promise<String>} - Console output
   */
  update(options = { clean: false, check: false, revision: null, tool: null },
    done = undefined) {
    const optionArgs = [];

    if (options.clean) optionArgs.push(' -C');
    if (options.revision) optionArgs.push(` -r ${options.revision}`);
    if (options.check) optionArgs.push(' -c');
    if (options.tool) optionArgs.push(` -t ${options.tool}`);

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
  gitify(options = { gitRepoPath: Path.dirname(this.path) }, done = undefined) {
    const gitDirectory = Path.resolve(options.gitRepoPath, `${this.name}-git`);

    return Command.run(`${this.pythonPath} -V`)
      .then((output) => {
        if (!output.stderr.includes('2.7')) throw new Error('Conversion library currently only supports Python 2.7.x ');

        return ensureGitify(this.pythonPath);
      })
      .then(() => Command.run(`git clone gitifyhg::${this.path} ${gitDirectory}`, options.gitRepoPath))
      .asCallback(done);
  }

  /**
   * Hg rename
   *
   * @params {String} source
   * @params {String} destination
   * @params {Object} options
   * @params {Boolean} [options.after = false]
   * @params {Boolean} [options.force = false]
   * @params {String} [options.include = null]
   * @params {String} [options.exclude = null]
   * @params {Boolean} [options.dryRun = null]
   * @params  {Function} [done] - Callback function
   */
  rename(
    source,
    destination,
    options = {
      after: false,
      force: false,
      include: null,
      exclude: null,
      dryRun: false,
    },
    done = undefined) {
    const optionArgs = [];

    optionArgs.push(source);
    optionArgs.push(destination);
    if (options.force) optionArgs.push(' -f');
    if (options.after) optionArgs.push(' -A');
    if (options.include) optionArgs.push(` -I ${options.include}`);
    if (options.exclude) optionArgs.push(` -X ${options.exclude}`);
    if (options.dryRun) optionArgs.push(' -n');

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
  merge(options = { force: false, revision: null, preview: false, tool: null }, done = undefined) {
    const optionArgs = [];

    if (options.force) optionArgs.push(' -f');
    if (options.revision) optionArgs.push(` -r ${options.revision}`);
    if (options.preview) optionArgs.push(' -p');
    if (options.tool) optionArgs.push(` -t ${options.tool}`);

    return Command.run('hg merge', this.path, optionArgs)
      .asCallback(done);
  }
};
