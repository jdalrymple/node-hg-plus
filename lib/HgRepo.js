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

  init(done = undefined) {
    return Command.run('hg init', this.path)
      .asCallback(done);
  }

  commit(message = null, options = { add: false }, done = undefined) {
    if (!message) throw new Error('Commit\'s must have a message');

    const optionalArgs = [];

    if (options.add) optionalArgs.push('-a');

    optionalArgs.push(`-m "${message}"`);

    return Command.run('hg commit', this.path, optionalArgs)
      .asCallback(done);
  }

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

  push(
    options = {
      destination: this.path,
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

    optionArgs.push(options.destination);

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

  gitify(options = { gitRepoPath: Path.resolve(Path.dirname(this.path), `${this.name}-git`) }, done = undefined) {
    return Command.run(`${this.pythonPath} -V`)
      .then((output) => {
        if (!output.stderr.includes('2.7')) throw new Error('Conversion library currently only supports Python 2.7.x ');

        return ensureGitify(this.pythonPath);
      })
      .then(() => Command.run(`git clone gitifyhg::${this.path} ${options.gitRepoPath}`, options.gitRepoPath))
      .asCallback(done);
  }

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
