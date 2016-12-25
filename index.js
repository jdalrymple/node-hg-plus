const Hg = require('./lib/Hg');
const HgRepo = require('./lib/HgRepo');

module.exports = {
  Hg: options => new Hg(options),
  HgRepo: (options, pythonPath) => new HgRepo(options, pythonPath),
};
