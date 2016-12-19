# ast-processor-babylon-config

Unified interface to a babylon AST.

## Install

```
$ npm install [--save] ast-processor-babylon-config
```

## Usage

```js
import build from 'ast-processor-babylon-config';
import { parse } from 'babylon';

let source = '3 + 4;';
let config = build(source, parse(source));
config.traverse(config.ast, (node, parent) => {
  console.log(
    `${node.type} in ${parent.type}: ` +
    source.slice(config.startOfNode(node), config.endOfNode(node))
  );
});

/*
prints:

Program in File: 3 + 4;
ExpressionStatement in Program: 3 + 4;
BinaryExpression in ExpressionStatement: 3 + 4
NumericLiteral in BinaryExpression: 3
NumericLiteral in BinaryExpression: 4
*/
```
