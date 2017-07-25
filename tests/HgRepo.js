const HgRepo = require('../src/HgRepo');
const Path = require('path');
const Test = require('blue-tape');
const IsThere = require('is-there');
const Fs = require('fs-extra');
const Command = require('../src/Command');
const Promise = require('bluebird');

const pythonPath = 'python2.7';

async function deleteTestRepositories() {
  await Fs.remove(Path.resolve('tests', 'test-repositories'));
  await Fs.remove(Path.resolve('tests', 'results', 'HgRepo'));
}

async function createTestRepositories() {
  const testDir1 = Path.resolve('tests', 'test-repositories', 'repository1');
  const testDir2 = Path.resolve('tests', 'test-repositories', 'repository2');

  const testFile1 = Path.resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = Path.resolve(testDir2, 'ReadMe2.txt');

  await Fs.ensureFile(testFile1);
  await Fs.writeFile(testFile1, 'Readme1');
  await Fs.ensureFile(testFile2);
  await Fs.writeFile(testFile2, 'Readme2');

  await Promise.each([testDir1, testDir2], async (directory) => {
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

Test('Creating a HgRepo Object.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'creation', 'basic');
  const to = { name: 'creation', url: 'http://bitbucket.org/repo/default', username: 'testUser', password: 'testPass', path };
  const testRepo1 = new HgRepo(to);

  // Test proper creation
  assert.equal(testRepo1.url, 'http://bitbucket.org/repo/default', 'URL property is set correctly');
  assert.equal(testRepo1.path, path, 'Path property is set correctly');
  assert.equal(testRepo1.username, 'testUser', 'Username property is set correctly');
  assert.equal(testRepo1.password, 'testPass', 'Password property is set correctly');

  // Test folder creation
  assert.true(IsThere(path), 'HgRepo-creation folder exists');
  assert.end();
});

Test('Creating a HgRepo Object with default name.', (assert) => {
  const currentDir = process.cwd();
  const path = Path.resolve('tests', 'results', 'HgRepo', 'creation');
  const to = { url: 'http://bitbucket.org/repo/default', username: 'testUser', password: 'testPass' };

  process.chdir(path);

  const repo = new HgRepo(to);

  // Test proper creation
  assert.equal(repo.path, Path.join(process.cwd(), 'default'), 'Default path property is set correctly');
  assert.equal(repo.name, 'default', 'Default name property is set correctly');

  process.chdir(currentDir);

  assert.end();
});

Test('Creating a HgRepo Object without required params.', (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'creation', 'error');

  const to = { username: 'testUser', password: 'testPass', path };

  try {
    const fail = new HgRepo(to);
  } catch (error) {
    assert.true(error.message.includes('Must supply a name or remote url when creating a HgRepo instance'));
  }

  assert.end();
});

Test('Hg Init in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'init');
  const to = { name: 'init', username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  await testRepo.init();

  assert.true(IsThere(Path.join(path, '.hg')), 'HgRepo-init hg folder exists');
});

Test('Hg commit in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'commit');
  const to = { name: 'commit', username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  await testRepo.init();

  try {
    await testRepo.commit();
  } catch (error) {
    assert.true(error.message.includes('Commit\'s must have a message'),
      'Trigger error when no commit message is passed');
  }

  const output = await testRepo.commit('Fake commit');

  assert.true(output.includes('nothing changed'), 'Committing files was successfull');
});

Test('Hg add in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'add');
  const to = { name: 'add', username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  await testRepo.init();
  await Fs.ensureFile(Path.join(path, 'Readme.txt'));
  await testRepo.add();

  const output = await testRepo.commit('Add commit');

  assert.true(output === '', 'Adding files was successfull');
});

Test('Hg pull in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'pull');
  const to = { name: 'pull', username: 'testUser', password: 'testPass', path };
  const testDir = Path.resolve('tests', 'test-repositories', 'repository2');
  const testRepo = new HgRepo(to);

  await testRepo.init();
  await testRepo.pull({ source: testDir, force: true });
  assert.true(IsThere(Path.join(testDir, 'ReadMe2.txt')),
    'Pulling files into repository was successfull');
});

Test('Hg push in a HgRepo.', async (assert) => {
  const destSub = Path.resolve('tests', 'results', 'HgRepo', 'push', 'dest');
  const sourceSub = Path.resolve('tests', 'results', 'HgRepo', 'push', 'source');
  const sourceRepo = new HgRepo({ name: 'push', username: 'testUser', password: 'testPass', path: sourceSub });
  const destRepo = new HgRepo({ name: 'push', username: 'testUser', password: 'testPass', path: destSub });

  await sourceRepo.init();
  await Fs.ensureFile(Path.join(sourceSub, 'ReadMePush1.txt'));
  await sourceRepo.add();
  await sourceRepo.commit('Making push test data');
  await destRepo.init();
  await sourceRepo.push({ force: true, destination: destSub });
  await destRepo.update();

  assert.true(IsThere(Path.join(destSub, 'ReadMePush1.txt')),
    'Pushing files into repository was successfull');
});

Test('Hg update in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'update');
  const to = { name: 'update', username: 'testUser', password: 'testPass', path };
  const testRepo = new HgRepo(to);

  await testRepo.init();
  await Fs.ensureFile(Path.join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await Fs.ensureFile(Path.join(testRepo.path, 'ReadMeUpdate2.txt'));
  await testRepo.update({ clean: true, revision: 'tip' });

  const output = await testRepo.commit('There should be nothing to commit');

  assert.true(output.includes('nothing changed'),
    'Updating repository was successfull');
});

Test('Hg rename in a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'rename');
  const to = { name: 'rename', username: 'testUser', password: 'testPass', path };
  const innerDir = Path.join(path, 'inner-dir');
  const testRepo = new HgRepo(to);

  await testRepo.init();
  await Fs.ensureFile(Path.join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await Fs.ensureDir(innerDir);
  await testRepo.rename('*', innerDir);

  assert.true(IsThere(Path.join(innerDir, 'ReadMeUpdate1.txt')), 'Repo files successfully renamed');
});

Test('gitify a HgRepo.', async (assert) => {
  const path = Path.resolve('tests', 'results', 'HgRepo', 'gitify', 'original');
  const to = { name: 'original', username: 'testUser', password: 'testPass', path };
  const gitPath = Path.resolve('tests', 'results', 'HgRepo', 'gitify', 'original-git');
  const testRepo = new HgRepo(to, pythonPath);

  await testRepo.init();
  await Fs.ensureFile(Path.join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await testRepo.gitify();

  assert.true(IsThere(gitPath), 'Git repo exists');
  assert.true(IsThere(Path.join(gitPath, '.git')), '.git folder exists');
});
