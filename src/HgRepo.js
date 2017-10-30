const Fs = require('fs-extra');
const Path = require('path');
const Globby = require('globby');
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
    if (!url && !path && !name) throw new Error('Must supply a remote url, a name, or a path when creating a HgRepo instance');

    this.url = url;
    this.username = username;
    this.password = password;
    this.pythonPath = pythonPath;
    this.name = name || Utils.getBasename(path) || Utils.getRemoteRepoName(url);
    this.path = path || Path.join(process.cwd(), this.name);
  }

  async add({ files = [''], include, exclude, subrepos = false, dryRun = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (dryRun) optionArgs.push(' -n');

    return Command.runWithHandling('hg add', this.path, optionArgs, done);
  }

  async checkout({ clean = false, check = false, revision, branchOrTag, tool } = {}, done) {
    return this.update({ clean, check, revision, branchOrTag, tool }, done);
  }

  async commit(message = null, { add = false } = {}, done) {
    if (!message) throw new Error("Commit's must have a message");

    const optionalArgs = [];
    let output;

    if (add) optionalArgs.push('-a');

    optionalArgs.push(`-m "${message}"`);

    // Cant use wrapper since this failure isnt an error
    try {
      output = await Command.run('hg commit', this.path, optionalArgs);
    } catch (e) {
      output = { stdout: e.stdout };

      if (!e.stdout.includes('nothing changed')) output.error = e;
    }

    return Utils.asCallback(output.error, output.stdout, done);
  }

  async gitify({ path = Path.resolve(Path.dirname(this.path), `${this.name}-git`), remoteURL, trackAll = false, clean = false } = {}, done) {
    const checkVersion = await Command.run(`${this.pythonPath} -V`);
    let cloneCmd;

    if (clean) {
      cloneCmd = `git clone gitifyhg::-gu${this.path} ${path}`;
    } else {
      cloneCmd = `git clone gitifyhg::${this.path} ${path}`;
    }

    if (!checkVersion.stderr.includes('2.7')) {
      throw new Error('Conversion library currently only supports Python 2.7.x.');
    }

    await ensureGitify(this.pythonPath);
    await Command.run(cloneCmd);

    // Remove .hgtags from each folder
    const files = await Globby(['**/.hgtags'], { dot: true, cwd: path });

    if (files.length) {
      await Promise.all(files.map(hgpath => Fs.remove(Path.resolve(path, hgpath))));
      await Command.run('git add', path, ['-A']);
      await Command.run('git commit', path, ['-m "Removing .hgtags"']);
    }

    // Rename .hgignore to .gitignore, and remove the line syntax:*
    const hgIgnoreFiles = await Globby(['**/.hgignore'], { dot: true, cwd: path });

    if (hgIgnoreFiles.length) {
      await Promise.all(hgIgnoreFiles.map(async(ignoreFile) => {
        const dir = Path.dirname(ignoreFile);
        const newPath = Path.resolve(path, dir, '.gitignore');

        Fs.renameSync(Path.resolve(path, ignoreFile), newPath);

        const data = Fs.readFileSync(newPath, 'utf8');

        return Fs.outputFile(newPath, data.replace(/syntax(.*)\n/, ''));
      }));

      await Command.run('git add', path, ['-A']);
      await Command.run('git commit', path, ['-m "Changing .hgignore to be .gitignore and removing syntax line"']);
    }

    if (remoteURL) {
      await Command.run('git remote set-url origin', path, [remoteURL]);
    }

    if (trackAll) {
      let trackCmd = "for branch in  `git branch -r | grep -v 'HEAD\\|master'`; do   \n";
      trackCmd += ' git branch --track ${branch##*/} $branch; \n'; // eslint-disable-line no-template-curly-in-string
      trackCmd += 'done';

      await Command.run(trackCmd, path);
    }

    await Fs.remove(Path.join(path, '.git', 'hg'));
    await Fs.remove(Path.join(path, '.git', 'refs', 'hg'));


    return Utils.asCallback(null, null, done);
  }

  async init() {
    return Command.runWithHandling('hg init', this.path);
  }

  async merge({ force = false, revision, preview = false, tool } = {}, done) {
    const optionArgs = [];

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (preview) optionArgs.push(' -p');
    if (tool) optionArgs.push(` -t ${tool}`);

    return Command.runWithHandling('hg merge', this.path, optionArgs, done);
  }

  async paths(done) {
    const pathsString = await Command.run('hg paths', this.path);
    const paths = {};
    const lines = pathsString.stdout.split('\n');

    lines.forEach((line) => {
      if (line === '') return;
      const name = line.match(/(^.+)\s=/)[0];
      const cleanedName = name.replace('=', '').trim();

      paths[cleanedName] = line.replace(name, '').trim();
    });

    return Utils.asCallback(null, paths, done);
  }

  async pull({ source = this.url, force = false, update = false, revision, bookmark, branch, newBranch = false, ssh, insecure = false } = {}, done) {
    const optionArgs = [];

    if (!source) throw new Error('Missing remote url to pull from');

    optionArgs.push(source);

    if (force) optionArgs.push(' -f');
    if (update) optionArgs.push(' -u');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    return Command.runWithHandling('hg pull', this.path, optionArgs, done);
  }

  async push({ destination = this.url, password, username, force = false, revision, bookmark, branch, newBranch = false, ssh, insecure = false } = {}, done) {
    const optionArgs = [];

    if (!destination) throw new Error('Missing remote url to push to');

    optionArgs.push(Utils.buildRepoURL({ username, password, url: destination }));

    if (force) optionArgs.push(' -f');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (bookmark) optionArgs.push(` -B ${bookmark}`);
    if (branch) optionArgs.push(` -b ${branch}`);
    if (newBranch) optionArgs.push(' --new-branch');
    if (ssh) optionArgs.push(` -e ${ssh}`);
    if (insecure) optionArgs.push(' --insecure');

    return Command.runWithHandling('hg push', this.path, optionArgs, done);
  }

  async remove({ files = [''], include, exclude, subrepos = false, force = false, after = false } = {}, done) {
    const optionArgs = [];

    optionArgs.push(files.join(' '));

    if (include) optionArgs.push(` -I ${include}`);
    if (exclude) optionArgs.push(` -X ${exclude}`);
    if (subrepos) optionArgs.push(' -S');
    if (force) optionArgs.push(' -f');
    if (after) optionArgs.push(' -A');

    return Command.runWithHandling('hg remove', this.path, optionArgs, done);
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

    return Command.runWithHandling('hg rename', this.path, optionArgs, done);
  }

  async update({ clean = false, check = false, revision, tool, branchOrTag } = {}, done) {
    const optionArgs = [];

    if (branchOrTag) optionArgs.push(branchOrTag);
    if (clean) optionArgs.push(' -C');
    if (revision) optionArgs.push(` -r ${revision}`);
    if (revision) optionArgs.push(` -r ${revision}`);

    if (check) optionArgs.push(' -c');
    if (tool) optionArgs.push(` -t ${tool}`);

    return Command.runWithHandling('hg update', this.path, optionArgs, done);
  }
}

module.exports = HgRepo;
