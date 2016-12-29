'use-strict';

const Exec = require('child_process').exec;
const Promise = require('bluebird');

function run(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `${command} ${options.join(' ')}`;

    Exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      const output = { error, stdout, stderr };
      if (error) {
        reject(output);
        return;
      }
      resolve(output);
    });
  });
}

module.exports = {
  run,
};
