const Exec = require('child_process').exec;
const Promise = require('bluebird');

function runCommand(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `hg ${command} ${options.join(' ')}`

    Exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }

      resolve(stdout);
    })
  });
}

module.exports = {
  run: runCommand
}