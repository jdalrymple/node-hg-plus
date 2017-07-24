const Path = require('path');

function asCallback(args, callback) {
  if (callback) {
    return callback(args);
  }

  return args;
}

function buildRepoURL(urlObject) {
  if (urlObject.password && urlObject.username) {
    const parsedURL = new URL(urlObject.url);

    return `${parsedURL.host}://${urlObject.username}:${urlObject.password}@${parsedURL.host}${parsedURL.pathname}`;
  }

  return urlObject.url;
}

function generateRepoPath(url) {
  const parsedURL = new URL(url);
  const split = parsedURL.pathname.split('/');

  return Path.join(process.cwd(), split[split.length - 1]);
}

module.exports = {
  asCallback,
  buildRepoURL,
  generateRepoPath,
};
