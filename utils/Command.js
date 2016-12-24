const Exec = require('child_process').exec;
const Promise = require('bluebird');

function run(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `${command} ${options.join(' ')}`;
    console.log(commandString)
    console.log(directory)
    Exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = {
  run,
};
