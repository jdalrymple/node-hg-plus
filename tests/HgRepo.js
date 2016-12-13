const HgRepo = require('../HgRepo');
const Path = require('path');
const Test = require('tape');

test('Assertions with tape.', (assert) => {
  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});

