const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Path = require('path');

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
   * @param  {url:String, user:String, pass:String, path:String}   to   [description]
   * @param  {Function} done [description]
   *
   * @return {[type]}        [description]
   */
  init(done = undefined) {
    return Command.run('hg init', this.path)
      .asCallback(done);
  }

  commit(message, done = undefined) {
    if (!message) throw new Error('Commit\'s must have a message');

    return Command.run('hg commit', this.path, ['-m', `"${message}"`])
      .asCallback(done);
  }

  add(options, done = undefined) {
    return Command.run('hg add', this.path, options)
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
