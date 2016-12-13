const Hg = require('../index');
const Path = require('path');
const Test = require('tape');

test('Cloning multiple Hg repositories into one.', (assert) => {
  const testRepo1 = { url: './TestRepositories/repository1' };
  const testRepo2 = { url: './TestRepositories/repository1' };
  const to = { path: Path.resolve('TestResults', 'CloneMultiple') };

  //Test that files exist
  //Test hg history
  Hg.clone([testRepo1, testRepo2], to);

  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});

test('Cloning one Hg repository.', (assert) => {
  const testRepo1 = { url: './TestRepositories/repository1' };
  const testRepo2 = { url: './TestRepositories/repository1' };
  const to = { path: Path.resolve('TestResults', 'CloneSingle') };

  //Test that files exist
  //Test hg history
  Hg.clone(testRepo1, to);

  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});

test('Creating a Hg repository.', (assert) => {
  let to = { path: Path.resolve('TestResults', 'Create') };

  //Test that files exist
  //Test hg history
  Hg.create(to);

  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});

test('Getting the version of Hg on the local machine.', (assert) => {
  Hg.version();

  //Test output
  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});
