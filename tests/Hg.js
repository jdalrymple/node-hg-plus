const Hg = require('../index');
const Path = require('path');
const Test = require('blue-tape');
const IsThere = require("is-there");
const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Promise = require('bluebird');

function deleteTestRepositories() {
  return Fs.removeAsync(Path.resolve('tests', 'test-repositories'))
    .then(() => Fs.removeAsync(Path.resolve('tests', 'results')));
}

function createTestRepositories() {
  const testDir1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testDir2 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');

  return Fs.ensureFileAsync(testFile1)
    .then(() => Fs.writeFileAsync(testFile1, 'Readme1'))
    .then(() => Fs.ensureFileAsync(testFile2))
    .then(() => Fs.writeFileAsync(testFile2, 'Readme2'))
    .then(() => Promise.each([testDir1, testDir2], (directory) => {
      return Command.run('init', directory)
        .then(() => Command.run('add', directory))
        .then(() => Command.run('commit', directory, ['-m', '"Init Commit"']));
    }))
    .catch((error) => {
      console.log(error);
    });
}

Test('Cloning multiple Hg repositories into one.', (assert) => {
  const testRepo1 = { url: Path.resolve('tests', 'test-repositories', 'repository1') };
  const testRepo2 = { url: Path.resolve('tests', 'test-repositories', 'repository2') };
  const to = { path: Path.resolve('tests', 'results', 'clone-multiple') };

  // Test that files exist
  return deleteTestRepositories()
    .then(createTestRepositories)
    .then(() => Hg.clone([testRepo1, testRepo2], to))
    .then(() => {
      const outputDir = Path.resolve('tests', 'results', 'clone-multiple');
      const subFolder1 = Path.resolve(outputDir, 'repository1');
      const file1 = Path.resolve(subFolder1, 'ReadMe1.txt');
      const subFolder2 = Path.resolve(outputDir, 'repository2');
      const file2 = Path.resolve(subFolder2, 'ReadMe2.txt');

      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
      assert.true(IsThere(file2), 'The file ReadMe2.txt in repository2 exists');
    });
});

Test('Cloning a Hg repository.', (assert) => {
  const testRepo1 = { url: Path.resolve('tests', 'test-repositories', 'repository1') };
  const to = { path: Path.resolve('tests', 'results', 'clone-single') };

  // Test that files exist
  return deleteTestRepositories()
    .then(createTestRepositories)
    .then(() => Hg.clone(testRepo1, to))
    .then(() => {
      const outputDir = Path.resolve('tests', 'results', 'clone-single');
      const file1 = Path.resolve(outputDir, 'Readme1.txt');

      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
    });
});

Test('Creating a Hg repository.', (assert) => {
  const to = { path: Path.resolve('tests', 'results', 'create') };

  return deleteTestRepositories()
    .then(createTestRepositories)
    .then(() => Hg.create(to))
    .then(() => {
      const outputDir = Path.resolve('tests', 'results', 'create');

      assert.true(IsThere(outputDir), 'The combined repo folder does not exist');
    });
});

Test('Getting the version of Hg on the local machine.', (assert) => {
  return Hg.version()
    .then((output) => {
      assert.true(output.includes('Mercurial Distributed SCM (version'), 'Version function didnt return correctly. Is the mercurial program installed?');
    });
});
