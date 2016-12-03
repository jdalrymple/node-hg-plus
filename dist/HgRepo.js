'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__useDefault = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _childProcessPromise = require('child-process-promise');

var _fsExtraPromise = require('fs-extra-promise');

var _fsExtraPromise2 = _interopRequireDefault(_fsExtraPromise);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function runCommand(command, options) {
  return new _bluebird2.default(function (resolve, reject) {
    console.log('fff');
    resolve(true);
  });
  // return Spawn(`hg ${command} ${options}`, [], { capture: ['stdout', 'stderr'] });
}

var HgRepo = function () {
  /*
  Create a HgRepo with a root path defined by the passed in `@path`
  (defaults to `process.cwd()`)
  */
  function HgRepo() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();

    _classCallCheck(this, HgRepo);

    this.path = path;
    _fsExtraPromise2.default.mkdirs(path);
  }

  /*
  Initialize a new repository at the provided path.
  */


  _createClass(HgRepo, [{
    key: 'init',
    value: function init() {
      return runCommand('init', this.path);
    }
  }, {
    key: 'clone',
    value: function clone(from) {
      return runCommand('clone', [this.path, from]);
    }
  }]);

  return HgRepo;
}();

exports.default = HgRepo;
var __useDefault = exports.__useDefault = true;