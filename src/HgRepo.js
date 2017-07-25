const Fs = require('fs-extra');
const Path = require('path');
const Command = require('./Command');
const Utils = require('./Utils');

async function ensureGitify(pythonPath) {
  try {
    await Command.run(`${pythonPath} -c 'import gitifyhg'`);
  } catch (output) {
    if (output.error.message.includes('ImportError')) {
      const gitifyPath = Path.resolve('utils', 'gitifyhg', 'setup.py');

      throw new ReferenceError(`Must install gitifyhg. Run this command: ${pythonPath} ${gitifyPath} install`);
    }
  }
}

class HgRepo {
  constructor({ name, url, username = '', password = '', path } = {}, pythonPath = 'python') {
    if (!name && !url) throw new Error('Must supply a name or remote url when creating a HgRepo instance');

    this.url = url;
    this.username = username;
    this.password = password;
    this.name = Utils.getRemoteRepoName(url) || name;
    this.path = path || Path.join(process.cwd(), this.name);
    this.pythonPath = pythonPath;

    if (Fs.pathExistsSync(this.path)) throw new Error(`Repository already exists at this path: ${this.path}`);

    Fs.ensureDirSync(this.path);
  }

  async init() {
    return Command.run('hg init', this.path);
  }

  async commit(message = null, { add = false } = {}, done = undefined) {
    if (!message) throw new Error("Commit's must have a message");

    const optionalArgs = [];

    if (add) optionalArgs.push('-a');

    optionalArgs.push(`-m "${message}"`);

    try {
      const output = await Command.run('hg commit', this.path, optionalArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      if (output.stdout.includes('nothing changed') || !output.error) {
        return Utils.asCallback(output.stdout, done);
      }

      throw output.error;
    }
  }

  async add({ files = [''], include, exclude, subrepos = false, dryRun = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (dryRun) optionArgs.push(' -n');

    try {
      const output = await Command.run('hg add', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async remove({ files = [''], include, exclude, subrepos = false, force = false, after = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');

    try {
      const output = await Command.run('hg remove', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async push({ destination = this.url, password, username, force = false, revision, bookmark, branch, newBranch = false, ssh, insecure = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(Utils.buildRepoURL({ username, password, url: destination }));

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    try {
      const output = await Command.run('hg push', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async pull({ source = this.url, force = false, update = false, revision, bookmark, branch, newBranch = false, ssh, insecure = false, } = {}, done) {
    const optionArgs = [];

    optionArgs.push(source);

    if (force) optionArgs.push(' -f');
    if (update) optionArgs.push(' -u');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    try {
      const output = await Command.run('hg pull', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async update({ clean = false, check = false, revision, tool } = {}, done) {
    const optionArgs = [];

    if (clean) optionArgs.push(' -C');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (check) optionArgs.push(' -c');
    if (tool) optionArgs.push(` -t ${tool}`);

    try {
      const output = await Command.run('hg update', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async gitify(gitRepoPath = Path.resolve(Path.dirname(this.path), `${this.name}-git`), done) {
    const checkVersion = await Command.run(`${this.pythonPath} -V`);

    if (!checkVersion.stderr.includes('2.7')) {
      throw new Error('Conversion library currently only supports Python 2.7.x.');
    }

    await ensureGitify(this.pythonPath);

    try {
      const output = await Command.run(`git clone gitifyhg::${this.path}  ${gitRepoPath}`);
      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async rename(source, destination, { after = false, force = false, include, exclude, dryRun = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(source);
    optionArgs.push(destination);

    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');
    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (dryRun) optionArgs.push(' -n');

    try {
      const output = await Command.run('hg rename', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }

  async merge({ force = false, revision, preview = false, tool } = {}, done) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (preview) optionArgs.push(' -p');
    if (tool) optionArgs.push(` -t ${tool}`);

    try {
      const output = await Command.run('hg merge', this.path, optionArgs);

      return Utils.asCallback(output.stdout, done);
    } catch (output) {
      throw output.error;
    }
  }
}

module.exports = HgRepo;
