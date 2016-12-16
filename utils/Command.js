const Exec = require('child_process').exec;
const Promise = require('bluebird');
const Shell = require('shelljs');

function run(command, directory = process.cwd(), options = [], type = 'hg') {
  return new Promise((resolve, reject) => {
    const commandString = `${type} ${command} ${options.join(' ')}`;
    Exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

function runShell(command, directory = process.cwd(), options = [], type = 'hg') {
  return new Promise((resolve, reject) => {
    const commandString = `${type} ${command} ${options.join(' ')}`;
    Shell.exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
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
  runShell,
};
