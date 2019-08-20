import { join, resolve } from 'path';
import IsThere from 'is-there';
import {
  remove, ensureFile, writeFile, ensureDir,
} from 'fs-extra';
import { run } from '../src/Command';
import HgRepo from '../src/HgRepo';

const pythonPath = 'python2.7';

async function deleteTestRepositories() {
  await remove(resolve('tests', 'test-repositories'));
  await remove(resolve('tests', 'results', 'HgRepo'));
}

async function createTestRepositories() {
  const testDirectory = resolve('tests', 'test-repositories');
  const testDir1 = resolve(testDirectory, 'repository1');
  const testDir2 = resolve(testDirectory, 'repository2');
  const testRepo3 = 'https://bitbucket.org/mchaput/whoosh';

  const testFile1 = resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = resolve(testDir2, 'ReadMe2.txt');

  await ensureFile(testFile1);
  await writeFile(testFile1, 'Readme1');
  await ensureFile(testFile2);
  await writeFile(testFile2, 'Readme2');

  await Promise.all(
    [testDir1, testDir2].map(async (directory) => {
      await run('hg init', directory);
      await run('hg add', directory);
      await run('hg commit', directory, ['-m', '"Init Commit"']);
    }),
  );

  await run('hg clone', testDirectory, [testRepo3]);
}

beforeAll(async () => {
  await deleteTestRepositories();
  await createTestRepositories();
});

describe('Creating a HgRepo Object.', () => {
  const path = resolve('tests', 'results', 'HgRepo', 'creation', 'basic');
  const to = {
    name: 'creation',
    url: 'http://bitbucket.org/repo/default',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo1 = new HgRepo(to);

  // Test proper creation
  test('URL property is set correctly', () => {
    expect(testRepo1.url).toBe('http://bitbucket.org/repo/default');
  });

  test('Name property is set correctly', () => {
    expect(testRepo1.name).toBe('creation');
  });

  test('Path property is set correctly', () => {
    expect(testRepo1.path).toBe(path);
  });

  test('Username property is set correctly', () => {
    expect(testRepo1.username).toBe('testUser');
  });

  test('Password property is set correctly', () => {
    expect(testRepo1.password).toBe('testPass');
  });
});

test('Creating a HgRepo Object with default name based on URL.', async () => {
  const currentDir = process.cwd();
  const path = resolve('tests', 'results', 'HgRepo', 'creation', 'default-url');
  const to = {
    url: 'http://bitbucket.org/repo/default',
    username: 'testUser',
    password: 'testPass',
  };

  await ensureDir(path);

  process.chdir(path);

  const repo = new HgRepo(to);

  // Test 'Default path property is set correctly'
  expect(repo.path).toBe(join(process.cwd(), 'default'));

  // Test 'Default name property is set correctly'
  expect(repo.name).toBe('default');

  process.chdir(currentDir);
});

test('Creating a HgRepo Object with default name based on path.', () => {
  const path = resolve('tests', 'results', 'HgRepo', 'creation', 'default-path');
  const to = { path, username: 'testUser', password: 'testPass' };

  const repo = new HgRepo(to);

  // Test 'Default name property is set correctly'
  expect(repo.name).toBe('default-path');
});

test('Creating a HgRepo Object without required params.', () => {
  const to = { username: 'testUser', password: 'testPass' };

  expect(new HgRepo(to))
    .toThrow('Must supply a remote url, a name, or a path when creating a HgRepo instance');
});

test('Hg Init in a HgRepo should create an .hg folder', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'init');
  const to = {
    name: 'init',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo = new HgRepo(to);

  await ensureDir(path);
  await testRepo.init();

  expect(IsThere(join(path, '.hg'))).toBeTruthy();
});

test('Hg commit in a HgRepo.', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'commit');
  const to = {
    name: 'commit',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo = new HgRepo(to);

  await ensureDir(path);
  await testRepo.init();

  expect.assertions(1);
  expect(testRepo.commit()).rejects.toBe("Commit's must have a message");

  const output = await testRepo.commit('Fake commit');

  expect(output.includes('nothing changed')).toBeTruthy();
});

test('Hg add in a HgRepo.', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'add');
  const to = {
    name: 'add',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo = new HgRepo(to);

  await ensureDir(path);
  await testRepo.init();
  await ensureFile(join(path, 'Readme.txt'));
  await testRepo.add();

  expect.assertions(1);
  expect(testRepo.commit('Add commit')).resolves.toBe('');
});

test('Hg Paths method retrieves the default path', async () => {
  const to = {
    name: 'pull',
    username: 'testUser',
    password: 'testPass',
    path: resolve('tests', 'test-repositories', 'whoosh'),
  };
  const testRepo = new HgRepo(to);
  const paths = await testRepo.paths();

  expect(paths.default).toBe('https://bitbucket.org/mchaput/whoosh');
});

test('Hg pull in a HgRepo', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'pull');
  const to = {
    name: 'pull',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testDir = resolve('tests', 'test-repositories', 'repository2');
  const testRepo = new HgRepo(to);

  await ensureDir(testRepo.path);
  await testRepo.init();
  await testRepo.pull({ source: testDir, force: true });

  expect(IsThere(join(testDir, 'ReadMe2.txt'))).toBeTruthy();
});

test('Hg push in a HgRepo.', async () => {
  const destSub = resolve('tests', 'results', 'HgRepo', 'push', 'dest');
  const sourceSub = resolve('tests', 'results', 'HgRepo', 'push', 'source');
  const sourceRepo = new HgRepo({
    name: 'push',
    username: 'testUser',
    password: 'testPass',
    path: sourceSub,
  });
  const destRepo = new HgRepo({
    name: 'push',
    username: 'testUser',
    password: 'testPass',
    path: destSub,
  });

  await ensureDir(sourceRepo.path);
  await sourceRepo.init();
  await ensureFile(join(sourceSub, 'ReadMePush1.txt'));
  await sourceRepo.add();
  await sourceRepo.commit('Making push test data');

  await ensureDir(destRepo.path);
  await destRepo.init();
  await sourceRepo.push({ force: true, destination: destSub });
  await destRepo.update();

  expect(IsThere(join(destSub, 'ReadMePush1.txt'))).toBeTruthy();
});

test('Hg update in a HgRepo.', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'update');
  const to = {
    name: 'update',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo = new HgRepo(to);

  await ensureDir(testRepo.path);
  await testRepo.init();
  await ensureFile(join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await ensureFile(join(testRepo.path, 'ReadMeUpdate2.txt'));
  await testRepo.update({ clean: true, revision: 'tip' });

  const output = await testRepo.commit('There should be nothing to commit');

  expect(output.includes('nothing changed')).toBeTruthy();
});

test('Hg rename in a HgRepo.', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'rename');
  const to = {
    name: 'rename',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const innerDir = join(path, 'inner-dir');
  const testRepo = new HgRepo(to);

  await ensureDir(testRepo.path);
  await testRepo.init();
  await ensureFile(join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await ensureDir(innerDir);
  await testRepo.rename('*', innerDir);

  expect(IsThere(join(innerDir, 'ReadMeUpdate1.txt'))).toBeTruthy();
});

test('gitify a HgRepo.', async () => {
  const path = resolve('tests', 'results', 'HgRepo', 'gitify', 'original');
  const to = {
    name: 'original',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const gitPath = resolve('tests', 'results', 'HgRepo', 'gitify', 'original-git');
  const testRepo = new HgRepo(to, pythonPath);

  await ensureDir(testRepo.path);
  await testRepo.init();
  await ensureFile(join(testRepo.path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');
  await testRepo.gitify();

  expect(IsThere(gitPath)).toBeTruthy();
  expect(IsThere(join(gitPath, '.git'))).toBeTruthy();
});
