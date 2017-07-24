const Path = require('path');
const { URL } = require('url');
const Fs = require('fs-extra-promise');
const Promise = require('bluebird');

function asCallback(args, callback) {
  if (callback) {
    return callback(args);
  }

  return args;
}

function buildRepoURL(urlObject) {
  if (urlObject.password && urlObject.username) {
    const parsedURL = new URL(urlObject.url);

    return `${parsedURL.protocol}//${urlObject.username}:${urlObject.password}@${parsedURL.host}${parsedURL.pathname}`;
  }

  return urlObject.url;
}

function generateRepoPath(url) {
  const parsedURL = new URL(url);
  const split = parsedURL.pathname.split('/');

  return Path.join(process.cwd(), split[split.length - 1]);
}

function moveFiles(source, destination, files) {
  const movePromises = files.map((file) => {
    const sourcePath = Path.join(source, file);
    const destinationPath = Path.join(destination, file);

    return Fs.moveAsync(sourcePath, destinationPath);
  });

  return Promise.all(movePromises);
}

module.exports = {
  asCallback,
  buildRepoURL,
  generateRepoPath,
  moveFiles,
};
