# automatic-semicolon-insertion [![Build Status](https://travis-ci.org/decaffeinate/coffee-lex.svg?branch=master)](https://travis-ci.org/decaffeinate/coffee-lex)

Insert missing semicolons, remove unneeded ones.

## Install

```
$ npm install [--save] automatic-semicolon-insertion
```

If you're using an AST from babel (babylon) you can also install
`ast-processor-babylon-config` to make it easier. Otherwise you'll have
to implement the expected methods yourself.

## Usage

```js
import asi from 'automatic-semicolon-insertion';
import buildConfig from 'ast-processor-babylon-config';
import { parse } from 'babylon';

let source = 'let a = class {}'; // should have a semicolon after it
let ast = parse(source);
let config = buildConfig(source, ast);

asi(config);
let { insertions, removals } = config;
console.log({ insertions, removals });

/*
prints:

{ insertions: [ { index: 16, content: ';' } ], removals: [] }
*/
```
