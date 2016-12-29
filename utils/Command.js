const Exec = require('child_process').exec;
const Promise = require('bluebird');

const Log = console;

function run(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `${command} ${options.join(' ')}`;
    Log.log(commandString);
    Log.log(directory);
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
