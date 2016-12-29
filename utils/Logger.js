'use-strict';

const Winston = require('winston');

class Logger {
  constructor(logger) {
    this.logger = logger || {
      log: Winston.log,
      info: Winston.info,
    };
  }
}

module.exports = Logger;
