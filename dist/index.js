'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _HgRepo = require('./HgRepo');

var _HgRepo2 = _interopRequireDefault(_HgRepo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
The public facing API for various common Mercurial tasks.
*/
var Hg = {
  init: function init(initPath, done) {
    var repo = new _HgRepo2.default(initPath);

    return repo.init().catch(function () {}).asCallback(done);
  }
};

exports.default = Hg;