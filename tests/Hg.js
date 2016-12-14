const Hg = require('../index');
const Path = require('path');
const Test = require('tape');
const FileExists = require('file-exists');
const Fs = require('fs-extra-promise');
const Exec = require('child_process').exec;

function deleteTestRepositories() {
  const testDir1 = Path.resolve('TestRepositories', 'repository1');
  const testDir2 = Path.resolve('TestRepositories', 'repository2');
  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');

  return Fs.removeAsync(testFile1)
    .then(() => Fs.remove(testFile2));
}

function createTestRepositories() {
  const testDir1 = Path.resolve('TestRepositories', 'repository1');
  const testDir2 = Path.resolve('TestRepositories', 'repository2');
  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');

  return Fs.ensureFileAsync(testFile1)
    .then(() => Fs.writeFile(testFile1, 'Readme1'))
    .then(() => Fs.ensureFile(testFile2))
    .then(() => Fs.writeFile(testFile2, 'Readme2'))
    .then(() => {
      [testDir1, testDir2].forEach((directory) => {
        Exec('hg init', { cwd: directory }, () => {
          Exec('hg add', { cwd: directory }, () => {
            Exec('hg commit', { cwd: directory });
          });
        });
      });
    });
}

Test('Cloning multiple Hg repositories into one.', (assert) => {
  const testRepo1 = { url: './TestRepositories/repository1' };
  const testRepo2 = { url: './TestRepositories/repository1' };
  const to = { path: Path.resolve('TestResults', 'CloneMultiple') };

  // Test that files exist
  createTestRepositories()
    .then(() => Hg.clone([testRepo1, testRepo2], to))
    .then(() => {
      const outputDir = Path.resolve('TestResults', 'CloneMultiple');
      const subFolder1 = Path.resolve(outputDir, 'repository1');
      const file1 = Path.resolve(subFolder1, 'Readme.txt');
      const subFolder2 = Path.resolve(outputDir, 'repository2');
      const file2 = Path.resolve(subFolder2, 'Readme.txt');

      assert.true(FileExists(outputDir), 'The combined repo folder does not exist');
      assert.true(FileExists(subFolder1), 'The combined repo sub folder repository1 does not exist');
      assert.true(FileExists(subFolder2), 'The combined repo sub folder repository2 does not exist');
      assert.true(FileExists(file1), 'The file ReadMe.txt in repository1 does not exist');
      assert.true(FileExists(file2), 'The file ReadMe.txt in repository2 does not exist');
      assert.end();
    })
    .then(deleteTestRepositories);
});

Test('Cloning a Hg repository.', (assert) => {
  const testRepo1 = { url: './TestRepositories/repository1' };
  const to = { path: Path.resolve('TestResults', 'CloneSingle') };

  // Test that files exist
  createTestRepositories()
    .then(() => Hg.clone(testRepo1, to))
    .then(() => {
      const outputDir = Path.resolve('TestResults', 'CloneSingle');
      const subFolder1 = Path.resolve(outputDir, 'repository1');
      const file1 = Path.resolve(subFolder1, 'Readme.txt');

      assert.true(FileExists(outputDir), 'The combined repo folder does not exist');
      assert.true(FileExists(subFolder1), 'The combined repo sub folder repository1 does not exist');
      assert.true(FileExists(file1), 'The file ReadMe.txt in repository1 does not exist');
      assert.end();
    })
    .then(deleteTestRepositories);
});

Test('Creating a Hg repository.', (assert) => {
  const to = { path: Path.resolve('TestResults', 'Create') };

  Hg.create(to)
    .then(() => {
      const outputDir = Path.resolve('TestResults', 'Create');

      assert.true(FileExists(outputDir), 'The combined repo folder does not exist');
      assert.end();
    });
});

Test('Getting the version of Hg on the local machine.', (assert) => {
  Hg.version()
    .then((output) => {
      assert.true(output.includes('Mercurial Distributed SCM (version'), 'Version function didnt return correctly. Is the mercurial program installed?');
      assert.end();
    });
});
