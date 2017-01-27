const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Path = require('path');

function ensureGitify(pythonPath) {
  return Command.run(`${pythonPath} -c 'import gitifyhg'`)
    .catch((output) => {
      if (output.error.message.includes('ImportError')) {
        const gitifyPath = Path.resolve('utils', 'gitifyhg', 'setup.py');

        throw new ReferenceError(`Must install gitifyhg. Run this command: ${pythonPath} ${gitifyPath} install`);
      }
    });
}

module.exports = class HgRepo {
  constructor({ url = null, username = '', password = '', path = process.cwd() },
    pythonPath = 'python') {
    this.path = path;
    this.username = username;
    this.password = password;
    this.url = url;
    this.name = Path.basename(path);
    this.pythonPath = pythonPath;

    Fs.ensureDirSync(this.path);
  }

  init(done = undefined) {
    return Command.run('hg init', this.path)
    .asCallback(done);
  }

  commit(message = null, { add = false }, done = undefined) {
    if (!message) throw new Error("Commit's must have a message");

    const optionalArgs = [];

    if (add) optionalArgs.push('-a');

    optionalArgs.push(`-m "${message}"`);

    return Command.run('hg commit', this.path, optionalArgs)
    .asCallback(done);
  }

  add({
      files = [''],
      include = null,
      exclude = null,
      subrepos = false,
      dryRun = false,
    },
    done = undefined) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (dryRun) optionArgs.push(' -n');

    return Command.run('hg add', this.path, optionArgs)
    .asCallback(done);
  }

  remove({
      files = [''],
      include = null,
      exclude = null,
      subrepos = false,
      force = false,
      after = false,
    },
    done = undefined) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');

    return Command.run('hg remove', this.path, optionArgs)
    .asCallback(done);
  }

  push({
      destination = this.url,
      password = null,
      username = null,
      force = false,
      revision = null,
      bookmark = null,
      branch = null,
      newBranch = false,
      ssh = null,
      insecure = false,
    },
    done = undefined) {
    const optionArgs = [];
    let url;

    if (password || username) {
      url = `https://${username}:${password}@${url
        .split('@')
        .pop()}`;
    } else {
      url = destination;
    }

    optionArgs.push(url);

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

  pull({
      source = this.url,
      force = false,
      update = false,
      revision = null,
      bookmark = null,
      branch = null,
      newBranch = false,
      ssh = null,
      insecure = false,
    },
    done = undefined) {
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

    return Command.run('hg pull', this.path, optionArgs)
    .asCallback(done);
  }

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

  gitify({ gitRepoPath = Path.resolve(Path.dirname(this.path), `${this.name}-git`) },
    done = undefined) {
    return Command
      .run(`${this.pythonPath} -V`)
      .then((output) => {
        if (!output.stderr.includes('2.7')) {
          throw new Error('Conversion library currently only supports Python 2.7.x ');
        }

        return ensureGitify(this.pythonPath);
      })
      .then(() => Command.run(`git clone gitifyhg::${this.path} ${gitRepoPath}`))
      .asCallback(done);
  }

  rename(
    source,
    destination,
    {
      after = false,
      force = false,
      include = null,
      exclude = null,
      dryRun = false,
    },
    done = undefined) {
    const optionArgs = [];

    optionArgs.push(source);
    optionArgs.push(destination);
    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');
    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (dryRun) optionArgs.push(' -n');

    return Command.run('hg rename', this.path, optionArgs)
    .asCallback(done);
  }

  merge({ force = false, revision = null, preview = false, tool = null },
    done = undefined) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (preview) optionArgs.push(' -p');
    if (tool) optionArgs.push(` -t ${tool}`);

    return Command.run('hg merge', this.path, optionArgs)
    .asCallback(done);
  }
};

