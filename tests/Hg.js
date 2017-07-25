const Hg = require('../src/index')({ path: 'python2.7' });
const Path = require('path');
const Test = require('blue-tape');
const IsThere = require('is-there');
const Fs = require('fs-extra');
const Command = require('../src/Command');
const Promise = require('bluebird');
const DirectoryCompare = require('dir-compare');

async function deleteTestRepositories() {
  await Fs.remove(Path.resolve('tests', 'test-repositories'));
  await Fs.remove(Path.resolve('tests', 'results', 'Hg'));
}

async function createTestRepositories() {
  const testDir1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testDir2 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testDir3 = Path.resolve('tests', 'test-repositories', 'duplicate', 'repository2');

  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');
  const testFile3 = Path.resolve(testDir3, 'ReadMe3.txt');

  await Fs.ensureFile(testFile1);
  await Fs.writeFile(testFile1, 'Readme1');
  await Fs.ensureFile(testFile2);
  await Fs.writeFile(testFile2, 'Readme2');
  await Fs.ensureFile(testFile3);
  await Fs.writeFile(testFile3, 'Readme3');

  await Promise.each([testDir1, testDir2, testDir3], async (directory) => {
    await Command.run('hg init', directory);
    await Command.run('hg add', directory);
    await Command.run('hg commit', directory, ['-m', '"Init Commit"']);
  });
}

Test('Setup test data', async (assert) => {
  await deleteTestRepositories();
  await createTestRepositories();

  assert.true(true);
});

Test('Requiring the Hg Library', (assert) => {
  const HgLib1 = require('../src/index')(); // eslint-disable-line global-require

  assert.true(HgLib1.clone instanceof Function);
  assert.end();
});

Test('Setting the python path', (assert) => {
  const HgLib1 = require('../src/index')({ path: 'test' }); // eslint-disable-line global-require

  assert.true(HgLib1.pythonPath === 'test');

  HgLib1.pythonPath = 'python';

  assert.end();
});

Test('Cloning multiple local Hg repositories into one.', async (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = Path.resolve('tests', 'test-repositories', 'repository2');
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'local');

  const to = { name: 'clone-multiple', path: outputDirectory };

  await Hg.clone([testRepo1, testRepo2], to);

  const subFolder1 = Path.resolve(outputDirectory, 'repository1');
  const file1 = Path.resolve(subFolder1, 'ReadMe1.txt');
  const subFolder2 = Path.resolve(outputDirectory, 'repository2');
  const file2 = Path.resolve(subFolder2, 'ReadMe2.txt');

  assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
  assert.true(IsThere(file2), 'The file ReadMe2.txt in repository2 exists');
});

Test('Cloning multiple live Hg repositories into one.', async (assert) => {
  const testRepo1 = 'https://bitbucket.org/mchaput/whoosh';
  const testRepo2 = 'https://bitbucket.org/durin42/hg-git';
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'live');
  const testDirectory = Path.resolve('tests', 'test-repositories');

  const exclude = { excludeFilter: '.hg' };
  const to = { name: 'clone-multiple', path: outputDirectory };

  // Test that files exist
  await Hg.clone([testRepo1, testRepo2], to);
  await Command.run('hg clone', testDirectory, [testRepo1]);
  await Command.run('hg clone', testDirectory, [testRepo2]);

  await Promise.all([
    DirectoryCompare.compare(Path.join(testDirectory, 'whoosh'), Path.join(outputDirectory, 'whoosh'), exclude),
    DirectoryCompare.compare(Path.join(testDirectory, 'hg-git'), Path.join(outputDirectory, 'hg-git'), exclude),
  ])
    .spread((compare1, compare2) => {
      assert.true(compare1.same);
      assert.true(compare2.same);
    });
});

Test('Cloning multiple clashing Hg repositories into one.', async (assert) => {
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'clash');
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository2');
  const testRepo2 = Path.resolve('tests', 'test-repositories', 'duplicate', 'repository2');
  const to = { name: 'clone-multiple', path: outputDirectory };

  await Hg.clone([testRepo1, testRepo2], to);

  const directories = await Fs.readdir(outputDirectory);
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

Test('Cloning multiple Hg repositories into one with invalid array input params.', async (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = 3312312;
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array');
  const to = { name: 'clone-multiple-invalid', path: outputDirectory };

  try {
    await Hg.clone([testRepo1, testRepo2], to);
  } catch (error) {
    assert.true(error.message.includes('Incorrect type of from parameter.'));
  }
});

Test('Cloning multiple Hg repositories into one with completely invalid input params.', async (assert) => {
  const testRepo = 213123;
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array');
  const to = { name: 'clone-multiple-invalid', path: outputDirectory };

  try {
    await Hg.clone(testRepo, to);
  } catch (error) {
    assert.true(error.message.includes('Incorrect type of from parameter.'));
  }
});

Test('Cloning a Hg repository.', async (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-single');
  const to = { name: 'clone-single', path: outputDirectory };
  const file1 = Path.resolve(outputDirectory, 'ReadMe1.txt');

  await Hg.clone(testRepo1, to);

  assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
});

Test('Cloning a Hg repository with callback.', async (assert) => {
  const testRepo1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'clone-single-callback');
  const to = { name: 'clone-single-callback', path: outputDirectory };
  const file1 = Path.resolve(outputDirectory, 'ReadMe1.txt');

  Hg.clone(testRepo1, to, () => {
    assert.true(IsThere(file1), 'The file ReadMe1.txt in repository1 exists');
  });
});

Test('Creating a Hg repository with basic arguments.', async (assert) => {
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'create', 'basic');
  const to = { name: 'basic', path: outputDirectory };

  await Hg.create(to);

  assert.true(IsThere(outputDirectory), 'Repo was successfully created');
});

Test('Creating a Hg repository with default args.', async (assert) => {
  const originalDir = process.cwd();
  const outputDirectory = Path.resolve('tests', 'results', 'Hg', 'create', 'default');

  await Fs.ensureDir(outputDirectory);

  process.chdir(outputDirectory);

  await Hg.create({ name: 'default' });

  assert.true(IsThere(outputDirectory), 'Repo was successfully created');

  process.chdir(originalDir);
});

Test('gitify a Hg repository.', async (assert) => {
  const base = Path.resolve('tests', 'results', 'Hg', 'gitify');
  const path = Path.resolve(base, 'original');
  const gitPath = Path.resolve(base, 'gitified');
  const origDirectory = process.cwd();

  const to = { name: 'original', username: 'testUser', password: 'testPass', path };
  const testRepo = await Hg.create(to);

  await Fs.ensureFile(Path.join(path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');

  process.chdir(path);

  await Hg.gitify({ gitRepoPath: gitPath });

  assert.true(IsThere(gitPath), 'Git repo exists');
  assert.true(IsThere(Path.join(gitPath, '.git')), '.git folder exists');

  process.chdir(origDirectory);
});

Test('Getting the version of Hg on the local machine.', async (assert) => {
  const output = await Hg.version();

  assert.true(output.includes('Mercurial Distributed SCM (version'), 'Version function returned correctly.');
});
