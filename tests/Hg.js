const Hg = require('../index');
const Path = require('path');
const Test = require('blue-tape');
const IsThere = require('is-there');
const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Promise = require('bluebird');

const Log = console;

function deleteTestRepositories() {
  return Fs.removeAsync(Path.resolve('tests', 'test-repositories'))
    .then(() => Fs.removeAsync(Path.resolve('tests', 'results', 'Hg')));
}

function createTestRepositories() {
  const testDir1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testDir2 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testDir3 = Path.resolve('tests', 'test-repositories', 'duplicate', 'repository2');

  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');
  const testFile3 = Path.resolve(testDir3, 'ReadMe3.txt');

  return Fs.ensureFileAsync(testFile1)
    .then(() => Fs.writeFileAsync(testFile1, 'Readme1'))
    .then(() => Fs.ensureFileAsync(testFile2))
    .then(() => Fs.writeFileAsync(testFile2, 'Readme2'))
    .then(() => Fs.ensureFileAsync(testFile3))
    .then(() => Fs.writeFileAsync(testFile3, 'Readme3'))
    .then(() => Promise.each([testDir1, testDir2, testDir3], directory =>
      Command.run('hg init', directory)
      .then(() => Command.run('hg add', directory))
      .then(() => Command.run('hg commit', directory, ['-m', '"Init Commit"']))))
    .catch((error) => {
      throw error;
    });
}

Test('Setup test data', assert =>
  deleteTestRepositories()
  .then(createTestRepositories)
  .then(() => {
    assert.true(true);
  }));

Test('Requiring the Hg Library', (assert) => {
  const HgLib1 = require('../index'); // eslint-disable-line global-require

  assert.true(HgLib1.clone instanceof Function);
  assert.end();
});

Test('Setting the python path', (assert) => {
  const HgLib1 = require('../index'); // eslint-disable-line global-require

  HgLib1.setPythonPath('test');

  assert.true(HgLib1.pythonPath === 'test');
  assert.end();
});

Test('Cloning multiple local Hg repositories into one.', (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = Path.resolve('tests', 'test-repositories', 'repository2');
  const outputDir = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'local');

  const to = { path: outputDir };

  // Test that files exist
  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => {
      const subFolder1 = Path.resolve(outputDir, 'repository1');
      const file1 = Path.resolve(subFolder1, 'ReadMe1.txt');
      const subFolder2 = Path.resolve(outputDir, 'repository2');
      const file2 = Path.resolve(subFolder2, 'ReadMe2.txt');

      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
      assert.true(IsThere(file2), 'The file ReadMe2.txt in repository2 exists');
    })
    .catch((error) => {
      Log.error(error);
    });
});

Test('Cloning multiple live Hg repositories into one.', (assert) => {
  const testRepo1 = 'https://github.com/jdorfman/awesome-json-datasets.git';
  const testRepo2 = 'https://github.com/abhishekbanthia/Public-APIs.git';
  const outputDir = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'live');

  const to = { path: outputDir };

  // Test that files exist
  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => {
      const subFolder1 = Path.resolve(outputDir, 'repository1');
      const file1 = Path.resolve(subFolder1, 'ReadMe1.txt');
      const subFolder2 = Path.resolve(outputDir, 'repository2');
      const file2 = Path.resolve(subFolder2, 'ReadMe2.txt');

      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
      assert.true(IsThere(file2), 'The file ReadMe2.txt in repository2 exists');
    })
    .catch((error) => {
      Log.error(error);
    });
});

Test('Cloning multiple clashing Hg repositories into one.', (assert) => {
  const outputDir = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'clash');
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testRepo2 = Path.resolve('tests', 'test-repositories', 'duplicate', 'repository2');
  const to = { path: outputDir };

  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => Fs.readdirAsync(outputDir))
    .then((directories) => {
      const noHiddenDirectories = directories.filter(directory => !directory.includes('.'));

      noHiddenDirectories.forEach((directory) => {
        assert.true(directory.includes('repository2'));

        if (directory === 'repository2') {
          assert.true(IsThere(Path.resolve(outputDir, directory, 'ReadMe2.txt')),
            'The file ReadMe2.txt in repository2 exists');
        } else {
          assert.true(IsThere(Path.resolve(outputDir, directory, 'ReadMe3.txt')),
            'The file ReadMe3.txt in repository2 exists');
        }
      });
    });
});

Test('Cloning multiple Hg repositories into one with invalid array input params.', (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = 3312312;
  const to = { path: Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array') };

  // Test that it fails when
  // 1. Array but one repo is not correct
  return Hg.clone([testRepo1, testRepo2], to)
    .catch(TypeError, (error) => {
      assert.true(error.message.includes('Incorrect type of from parameter.'));
    });
});

Test('Cloning multiple Hg repositories into one with completely invalid input params.', (assert) => {
  const testRepo = 213123;
  const to = { path: Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array') };

  // Test that it fails when
  // 3. Not an object or array
  return Hg.clone(testRepo, to)
    .catch(TypeError, (error) => {
      assert.true(error.message.includes('Incorrect type of from parameter.'));
    });
});

Test('Cloning a Hg repository.', (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const to = { path: Path.resolve('tests', 'results', 'Hg', 'clone-single') };
  const file1 = Path.resolve('tests', 'results', 'Hg', 'clone-single', 'ReadMe1.txt');

  // Test that files exist
  return Hg.clone(testRepo1, to)
    .then(() => {
      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
    });
});

Test('Creating a Hg repository with basic arguments.', (assert) => {
  const to = { path: Path.resolve('tests', 'results', 'Hg', 'create', 'basic') };
  const outputDir = Path.resolve('tests', 'results', 'Hg', 'create', 'basic');

  return Hg.create(to)
    .then(() => {
      assert.true(IsThere(outputDir), 'Repo was successfully created');
    });
});


Test('Creating a Hg repository with default args.', (assert) => {
  const originalDir = process.cwd();
  const outputDir = Path.resolve('tests', 'results', 'Hg', 'create', 'default');

  return Fs.ensureDirAsync(outputDir)
    .then(() => {
      process.chdir(outputDir);
      return Promise.resolve();
    })
    .then(() => Hg.create())
    .then(() => {
      assert.true(IsThere(outputDir), 'Repo was successfully created');
      process.chdir(originalDir);
    });
});

Test('Getting the version of Hg on the local machine.', assert =>
  Hg.version()
  .then((output) => {
    assert.true(output.includes('Mercurial Distributed SCM (version'), 'Version function returned correctly.');
  }));
