const Hg = require('../index');
const Path = require('path');
const Test = require('blue-tape');
const IsThere = require('is-there');
const Fs = require('fs-extra-promise');
const Command = require('../utils/Command');
const Promise = require('bluebird');
const DirectoryCompare = require('dir-compare');

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
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'local');

  const to = { path: outputDirectory };

  // Test that files exist
  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => {
      const subFolder1 = Path.resolve(outputDirectory, 'repository1');
      const file1 = Path.resolve(subFolder1, 'ReadMe1.txt');
      const subFolder2 = Path.resolve(outputDirectory, 'repository2');
      const file2 = Path.resolve(subFolder2, 'ReadMe2.txt');

      assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
      assert.true(IsThere(file2), 'The file ReadMe2.txt in repository2 exists');
    });
});

Test('Cloning multiple live Hg repositories into one.', (assert) => {
  const testRepo1 = 'https://bitbucket.org/mchaput/whoosh';
  const testRepo2 = 'https://bitbucket.org/durin42/hg-git';
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'live');
  const testDirectory = Path.resolve('tests', 'test-repositories');

  const exclude = { excludeFilter: '.hg' };
  const to = { path: outputDirectory };

  // Test that files exist
  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => Command.run('hg clone', testDirectory, [testRepo1]))
    .then(() => Command.run('hg clone', testDirectory, [testRepo2]))
    .then(() => Promise.all([
      DirectoryCompare.compare(Path.join(testDirectory, 'whoosh'), Path.join(outputDirectory, 'whoosh'), exclude),
      DirectoryCompare.compare(Path.join(testDirectory, 'hg-git'), Path.join(outputDirectory, 'hg-git'), exclude),
    ]))
    .spread((compare1, compare2) => {
      assert.true(compare1.same);
      assert.true(compare2.same);
    });
});

Test('Cloning multiple clashing Hg repositories into one.', (assert) => {
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'clash');
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testRepo2 = Path.resolve('tests', 'test-repositories', 'duplicate', 'repository2');
  const to = { path: outputDirectory };

  return Hg.clone([testRepo1, testRepo2], to)
    .then(() => Fs.readdirAsync(outputDirectory))
    .then((directories) => {
      const noHiddenDirectories = directories.filter(directory => !directory.includes('.'));

      noHiddenDirectories.forEach((directory) => {
        assert.true(directory.includes('repository2'));

        if (directory === 'repository2') {
          assert.true(IsThere(Path.resolve(outputDirectory, directory, 'ReadMe2.txt')),
            'The file ReadMe2.txt in repository2 exists');
        } else {
          assert.true(IsThere(Path.resolve(outputDirectory, directory, 'ReadMe3.txt')),
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
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'create', 'basic');

  return Hg.create(to)
    .then(() => {
      assert.true(IsThere(outputDirectory), 'Repo was successfully created');
    });
});

Test('Creating a Hg repository with default args.', (assert) => {
  const originalDir = process.cwd();
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'create', 'default');

  return Fs.ensureDirAsync(outputDirectory)
    .then(() => {
      process.chdir(outputDirectory);
      return Promise.resolve();
    })
    .then(() => Hg.create())
    .then(() => {
      assert.true(IsThere(outputDirectory), 'Repo was successfully created');
      process.chdir(originalDir);
    });
});

Test('gitify a Hg repository.', (assert) => {
  const base = Path.resolve('tests', 'results', 'Hg', 'gitify');
  const path = Path.resolve(base, 'original');
  const gitPath = Path.resolve(base, 'gitified');
  const origDirectory = process.cwd;

  const to = { url: path, username: 'testUser', password: 'testPass', path };

  const testRepo = Hg.create(to);

  testRepo
    .then(() => Fs.ensureFileAsync(Path.join(path, 'ReadMeUpdate1.txt')))
    .then(() => testRepo.add())
    .then(() => testRepo.commit('Adding test data'))
    .then(() => {
      process.chdir(base);

      return Hg.gitify(gitPath);
    })
    .then(() => {
      assert.true(IsThere(gitPath), 'Git repo exists');
      assert.true(IsThere(Path.join(gitPath, '.git')), '.git folder exists');
      process.chdir(origDirectory);
    });
});

Test('Getting the version of Hg on the local machine.', assert =>
  Hg.version()
  .then((output) => {
    assert.true(output.includes('Mercurial Distributed SCM (version'), 'Version function returned correctly.');
  }));
