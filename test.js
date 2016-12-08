const Hg = require('./index')({
  username: 'justindalrymple',
  password: 'car0line',
});

const Path  = require('path');

const testRepo = 'https://justindalrymple@bitbucket.org/justindalrymple/node-hg';
const testRepo2 = 'https://justindalrymple@bitbucket.org/justindalrymple/test';

Hg.clone([testRepo,testRepo2], Path.resolve('..','cool'));