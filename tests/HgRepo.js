const HgRepo = require('../lib/HgRepo');
const Command = require('../utils/Command');

const Path = require('path');
const Test = require('blue-tape');
const IsThere = require('is-there');
const Fs = require('fs-extra-promise');
const Promise = require('bluebird');

const PythonPath = 'python2.7';

function deleteTestRepositories() {
  return Fs.removeAsync(Path.resolve('tests', 'test-repositories'))
    .then(() => Fs.removeAsync(Path.resolve('tests', 'results', 'HgRepo')));
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
    .then(() => Promise.each([testDir1, testDir2], directory =>
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

Test('Creating a HgRepo Object.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'creation');
  const to1 = { url: path, username: 'testUser', password: 'testPass', path };
  const testRepo1 = new HgRepo(to1);

  // Test proper creation
  assert.equal(testRepo1.url, path, 'URL property is set correctly');
  assert.equal(testRepo1.path, path, 'Path property is set correctly');
  assert.equal(testRepo1.username, 'testUser', 'Username property is set correctly');
  assert.equal(testRepo1.password, 'testPass', 'Password property is set correctly');

  // Test folder creation
  assert.true(IsThere(path), 'HgRepo-creation folder exists');
  assert.end();
});

Test('Hg Init in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'init');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => {
      assert.true(IsThere(Path.join(path, '.hg')), 'HgRepo-init hg folder exists');
    });
});

Test('Hg commit in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'commit');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => testRepo.commit())
    .catch((error) => {
      assert.true(error.message.includes('Commit\'s must have a message'),
      'Trigger error when no commit message is passed');
    })
    .then(() => testRepo.commit('Fake commit'))
    .catch((output) => {
      assert.true(output.stdout.includes('nothing changed'), 'Committing files was successfull');
    });
});

Test('Hg add in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'add');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => Fs.ensureFileAsync(Path.join(path, 'Readme.txt')))
    .then(() => testRepo.add())
    .then(() => testRepo.commit('Add commit'))
    .then((output) => {
      assert.true(output.stdout === '', 'Adding files was successfull');
    });
});

Test('Hg pull in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'pull');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const testDir = Path.resolve('tests', 'test-repositories', 'repository2');
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => testRepo.pull({ source: testDir, force: true }))
    .then(() => {
      assert.true(IsThere(Path.join(testDir, 'ReadMe2.txt')),
      'Pulling files into repository was successfull');
    });
});

Test('Hg push in a HgRepo.', (assert) => {
  const destSub = Path.resolve('tests', 'results', 'HgRepo', 'push', 'dest');
  const sourceSub = Path.resolve('tests', 'results', 'HgRepo', 'push', 'source');
  const sourceRepo = new HgRepo({ url: sourceSub, username: 'testUser', password: 'testPass', path: sourceSub });
  const destRepo = new HgRepo({ url: destSub, username: 'testUser', password: 'testPass', path: destSub });

  return sourceRepo.init()
    .then(() => Fs.ensureFileAsync(Path.join(sourceSub, 'ReadMePush1.txt')))
    .then(() => sourceRepo.add())
    .then(() => sourceRepo.commit('Making push test data'))
    .then(() => destRepo.init())
    .then(() => sourceRepo.push({ force: true, destination: destSub }))
    .then(() => destRepo.update())
    .then(() => {
      assert.true(IsThere(Path.join(destSub, 'ReadMePush1.txt')),
      'Pushing files into repository was successfull');
    });
});

Test('Hg update in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'update');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => Fs.ensureFileAsync(Path.join(testRepo.path, 'ReadMeUpdate1.txt')))
    .then(() => testRepo.add())
    .then(() => testRepo.commit('Adding test data'))
    .then(() => Fs.ensureFileAsync(Path.join(testRepo.path, 'ReadMeUpdate2.txt')))
    .then(() => testRepo.update({ clean: true, revision: 'tip' }))
    .then(() => testRepo.commit('There should be nothing to commit'))
    .catch((output) => {
      assert.true(output.stdout.includes('nothing changed'),
      'Updating repository was successfull');
    });
});

Test('Hg rename in a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'rename');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const innerDir = Path.join(path, 'inner-dir');
  const testRepo = new HgRepo(to);

  return testRepo.init()
    .then(() => Fs.ensureFileAsync(Path.join(testRepo.path, 'ReadMeUpdate1.txt')))
    .then(() => testRepo.add())
    .then(() => testRepo.commit('Adding test data'))
    .then(() => Fs.ensureDirAsync(innerDir))
    .then(() => testRepo.rename('*', innerDir))
    .then(() => {
      assert.true(IsThere(Path.join(innerDir, 'ReadMeUpdate1.txt')), 'Repo files successfully renamed');
    });
});

Test('gitify a HgRepo.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'gitify', 'original');
  const to = { url: path, username: 'testUser', password: 'testPass', path };
  const gitPath = Path.resolve('tests', 'results', 'HgRepo', 'gitify', 'original-git');
  const testRepo = new HgRepo(to, PythonPath);

  return testRepo.init()
    .then(() => Fs.ensureFileAsync(Path.join(testRepo.path, 'ReadMeUpdate1.txt')))
    .then(() => testRepo.add())
    .then(() => testRepo.commit('Adding test data'))
    .then(() => testRepo.gitify())
    .then(() => {
      assert.true(IsThere(gitPath), 'Git repo exists');
      assert.true(IsThere(Path.join(gitPath, '.git')), '.git folder exists');
    });
});
