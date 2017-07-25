'use-strict';

const Exec = require('child_process').exec;
const Promise = require('bluebird');
const Utils = require('./Utils');

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

async function runWithHandling(command, directory = process.cwd(), options = [], done){
  try {
    const output = await run(command, directory, options);

    return Utils.asCallback(output.error, output.stdout, done);
  } catch (output) {
    return Utils.asCallback(output.error, output.stdout, done);
  }
}
module.exports = {
  run,
  runWithHandling,
};
