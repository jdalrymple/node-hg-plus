import { basename, join, resolve } from 'path';
import { URL } from 'url';
import { move, pathExists, ensureDir } from 'fs-extra';

export function asCallback(error, args, callback) {
  if (callback) {
    return callback(error, args);
  }

  if (error) throw error;

  return args;
}

export function buildRepoURL(urlObject) {
  if (urlObject.password && urlObject.username) {
    const parsedURL = new URL(urlObject.url);

    return `${parsedURL.protocol}//${urlObject.username}:${urlObject.password}@${parsedURL.host}${parsedURL.pathname}`;
  }

  return urlObject.url;
}

export function getRemoteRepoName(url) {
  if (!url) return null;

  const parsedURL = new URL(url);
  const split = parsedURL.pathname.split('/');

  return split[split.length - 1];
}

export function getBasename(path) {
  if (!path) return null;

  return basename(path);
}

export function moveFiles(source, destination, files) {
  const movePromises = files.map((file) => {
    const sourcePath = join(source, file);
    const destinationPath = join(destination, file);

    return move(sourcePath, destinationPath);
  });

  return Promise.all(movePromises);
}

export async function ensureRepoPath(path) {
  try {
    await pathExists(path);
  } catch (e) {
    throw new Error(`Repository already exists at this path: ${path}`);
  }

  return ensureDir(path);
}

export async function checkForHGFolder(path) {
  const exists = await pathExists(resolve(path, '.hg'));

  if (!exists) {
    throw new Error(
      'A local repository does not exist at this location. Check your path arguement',
    );
  }
}
