import { join, resolve } from 'path';
import DirectoryCompare from 'dir-compare';
import IsThere from 'is-there';
import { remove, ensureFile, writeFile, readdir } from 'fs-extra';
import { run } from '../src/Command';
import HG from '../src/index';

const Hg = HG({ path: 'python2.7' });

async function deleteTestRepositories() {
  await remove(resolve('tests', 'test-repositories'));
  await remove(resolve('tests', 'results', 'Hg'));
}

async function createTestRepositories() {
  const testDirectory = resolve('tests', 'test-repositories');
  const testDir1 = resolve(testDirectory, 'repository1');
  const testDir2 = resolve(testDirectory, 'repository2');
  const testDir3 = resolve(testDirectory, 'duplicate', 'repository2');
  const testRepo3 = 'https://bitbucket.org/mchaput/whoosh';
  const testRepo4 = 'https://bitbucket.org/durin42/hg-git';

  const testFile1 = resolve(testDir1, 'ReadMe1.txt');
  const testFile2 = resolve(testDir2, 'ReadMe2.txt');
  const testFile3 = resolve(testDir3, 'ReadMe3.txt');

  await ensureFile(testFile1);
  await writeFile(testFile1, 'Readme1');
  await ensureFile(testFile2);
  await writeFile(testFile2, 'Readme2');
  await ensureFile(testFile3);
  await writeFile(testFile3, 'Readme3');

  await Promise.all(
    [testDir1, testDir2, testDir3].map(async directory => {
      await run('hg init', directory);
      await run('hg add', directory);
      await run('hg commit', directory, ['-m', '"Init Commit"']);
    }),
  );

  await run('hg clone', testDirectory, [testRepo3]);
  await run('hg clone', testDirectory, [testRepo4]);
}

beforeAll(async () => {
  await deleteTestRepositories();
  return createTestRepositories();
});

test('Requiring the Hg Library', () => {
  const HgLib1 = require('../src/index').default(); // eslint-disable-line global-require

  expect(HgLib1.clone).toBeInstanceOf(Function);
});

test('Setting the python path', () => {
  const HgLib1 = require('../src/index').default({ path: 'test' }); // eslint-disable-line global-require

  expect(HgLib1.pythonPath).toBe('test');
});

test('Cloning multiple local Hg repositories into one.', async () => {
  const testRepo1 = resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = resolve('tests', 'test-repositories', 'repository2');
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-multiple', 'local');
  const to = { name: 'clone-multiple', path: outputDirectory };

  await Hg.clone([testRepo1, testRepo2], to);

  const subFolder1 = resolve(outputDirectory, 'repository1');
  const file1 = resolve(subFolder1, 'ReadMe1.txt');
  const subFolder2 = resolve(outputDirectory, 'repository2');
  const file2 = resolve(subFolder2, 'ReadMe2.txt');

  expect(IsThere(file1)).toBeTruthy();
  expect(IsThere(file2)).toBeTruthy();
});

test('Cloning multiple live Hg repositories into one.', async () => {
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-multiple', 'live');
  const testDirectory = resolve('tests', 'test-repositories');
  const testRepo1 = 'https://bitbucket.org/mchaput/whoosh';
  const testRepo2 = 'https://bitbucket.org/durin42/hg-git';
  const exclude = { excludeFilter: '.hg' };
  const to = { name: 'clone-multiple', path: outputDirectory };

  // Test that files exist
  await Hg.clone([testRepo1, testRepo2], to);

  await Promise.all([
    DirectoryCompare.compare(
      join(testDirectory, 'whoosh'),
      join(outputDirectory, 'whoosh'),
      exclude,
    ),
    DirectoryCompare.compare(
      join(testDirectory, 'hg-git'),
      join(outputDirectory, 'hg-git'),
      exclude,
    ),
  ]).spread((compare1, compare2) => {
    expect(compare1.same, 'First repo didnt match').toBeTruthy();
    expect(compare2.same, 'Second repo did not match').toBeTruthy();
  });
});

test('Cloning multiple clashing Hg repositories into one.', async () => {
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-multiple', 'clash');
  const testRepo1 = resolve('tests', 'test-repositories', 'repository2');
  const testRepo2 = resolve('tests', 'test-repositories', 'duplicate', 'repository2');
  const to = { name: 'clone-multiple', path: outputDirectory };

  await Hg.clone([testRepo1, testRepo2], to);

  const directories = await readdir(outputDirectory);
  const noHiddenDirectories = directories.filter(directory => !directory.includes('.'));

  noHiddenDirectories.forEach(directory => {
    expect(directory.includes('repository2')).toBeTruthy();

    if (directory === 'repository2') {
      expect(
        IsThere(resolve(outputDirectory, directory, 'ReadMe2.txt')),
        'The file ReadMe2.txt in repository2 exists',
      ).toBeTruthy();
    } else {
      expect(
        IsThere(resolve(outputDirectory, directory, 'ReadMe3.txt')),
        'The file ReadMe3.txt in repository2 exists',
      ).toBeTruthy();
    }
  });
});

test('Cloning multiple Hg repositories into one with invalid array input params.', async () => {
  const testRepo1 = resolve('tests', 'test-repositories', 'repository1');
  const testRepo2 = 3312312;
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array');
  const to = { name: 'clone-multiple-invalid', path: outputDirectory };

  expect(Hg.clone([testRepo1, testRepo2], to)).rejects.toThrow(TypeError);
});

test('Cloning multiple Hg repositories into one with completely invalid input params.', async () => {
  const testRepo = 213123;
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-multiple', 'invalid-array');
  const to = { name: 'clone-multiple-invalid', path: outputDirectory };

  expect(Hg.clone(testRepo, to)).rejects.toThrow(TypeError);
});

test('Cloning a Hg repository.', async () => {
  const testRepo1 = resolve('tests', 'test-repositories', 'repository1');
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-single');
  const to = { name: 'clone-single', path: outputDirectory };
  const file1 = resolve(outputDirectory, 'ReadMe1.txt');

  await Hg.clone(testRepo1, to);

  expect(IsThere(file1)).toBeTruthy();
});

test('Cloning a Hg repository with callback.', async () => {
  const testRepo1 = resolve('tests', 'test-repositories', 'repository1');
  const outputDirectory = resolve('tests', 'results', 'Hg', 'clone-single-callback');
  const to = { name: 'clone-single-callback', path: outputDirectory };
  const file1 = resolve(outputDirectory, 'ReadMe1.txt');

  Hg.clone(testRepo1, to, () => {
    expect(IsThere(file1)).toBeTruthy();
  });
});

test('Creating a Hg repository with basic arguments.', async () => {
  const outputDirectory = resolve('tests', 'results', 'Hg', 'create', 'basic');
  const to = { name: 'basic', path: outputDirectory };

  await Hg.create(to);

  expect(IsThere(outputDirectory)).toBeTruthy();
});

test('Creating a Hg repository with one of the default args.', async () => {
  const originalDir = process.cwd();
  const outputDirectory = resolve('tests', 'results', 'Hg', 'create');

  process.chdir(outputDirectory);

  await Hg.create({ name: 'default-1' });

  expect(IsThere(join(outputDirectory, 'default-1'))).toBeTruthy();

  process.chdir(originalDir);
});

test('Creating a Hg repository with another one of the default args.', async () => {
  const originalDir = process.cwd();
  const outputDirectory = resolve('tests', 'results', 'Hg', 'create', 'default-2');

  const repo = await Hg.create({ path: outputDirectory });

  expect(IsThere(outputDirectory), 'Repo was successfully created').toBeTruthy();
  expect(repo.name, 'default-2', 'Repo was named correctly').toBeTruthy();

  process.chdir(originalDir);
});

test('Getting a HgRepo from a local repository.', async () => {
  const testDirectory = resolve('tests', 'test-repositories', 'repository1');

  const repo = await Hg.getRepo({ path: testDirectory });

  expect(repo, 'Repo was successfully created').toBeOk();
});

test('Getting a HgRepo from a local repository with a incorrect path', async () => {
  const testDirectory = resolve('tests', 'test-repositories', 'repository1');

  expect.assertions(1);
  expect(Hg.getRepo({ path: testDirectory })).rejects.toBe('A local repository does not exist');
});

test('gitify a Hg repository.', async () => {
  const base = resolve('tests', 'results', 'Hg', 'gitify');
  const path = resolve(base, 'original');
  const gitPath = resolve(base, 'gitified');
  const origDirectory = process.cwd();

  const to = {
    name: 'original',
    username: 'testUser',
    password: 'testPass',
    path,
  };
  const testRepo = await Hg.create(to);

  await ensureFile(join(path, 'ReadMeUpdate1.txt'));
  await testRepo.add();
  await testRepo.commit('Adding test data');

  process.chdir(path);

  await Hg.gitify({ path: gitPath });

  expect(IsThere(gitPath)).toBeTruthy();
  expect(IsThere(join(gitPath, '.git'))).toBeTruthy();

  process.chdir(origDirectory);
});

test('Getting the version of Hg on the local machine.', async () => {
  const output = await Hg.version();

  expect(output.includes('Mercurial Distributed SCM (version')).toBeTruthy();
});
