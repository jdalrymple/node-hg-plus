const Hg = require('./index')({
  username: 'justindalrymple',
  password: 'car0line',
});

// Hg.init('test', function(results) {
//   console.log(results);
// });
const testRepo = 'https://justindalrymple@bitbucket.org/justindalrymple/node-hg';
// Hg.init();


Hg.clone([testRepo, testRepo], 'cool');

// repo.add().commit().push();
