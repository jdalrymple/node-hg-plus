const Hg = require('./index');
const Path  = require('path');

//-------------------------------Testing HG
//Test clone
var from  = {url:'https://justindalrymple@bitbucket.org/justindalrymple/node-hg', username:'justindalrymple', password:'car0line'}
var from2  = {url:'https://justindalrymple@bitbucket.org/justindalrymple/test', username:'justindalrymple', password:'car0line'}
var toNull = {path:Path.resolve('..','cool'), url:null, username:null, password:null}
var toNull2 = {path:Path.resolve('..','cool2'), url:null, username:null, password:null}

Hg.clone([from,from2], toNull);
Hg.clone(from, toNull2);

//Test create
var toNull3 = {path:Path.resolve('..','cool3'), url:null, username:null, password:null}
Hg.create(toNull3);

//Test version
Hg.version()

