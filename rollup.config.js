import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: 'inline',
    },
    plugins: [
      resolve({}),
      commonjs(),
      eslint({
        exclude: 'node_modules/**',
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
];
