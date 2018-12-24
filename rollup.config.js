import resolve  from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble    from 'rollup-plugin-buble';
import { version, author, license, description } from './package.json';

const name = 'phtree';

const banner = `\
/**
 * ${name} v${version}
 * ${description}
 *
 * @author ${author}
 * @license ${license}
 * @preserve
 */
`;

module.exports = [{
  input: './src/bvh/bvh.js',
  output: {
    file: `dist/${name}.umd.js`,
    name: name,
    sourcemap: true,
    format: 'umd',
    banner
  },
  plugins: [
    resolve({ browser: true }),  // so Rollup can find external libs
    commonjs(), // so Rollup can convert commonJS to an ES module
    buble()
  ]
}, {
  input: './src/sfc-tree.js',
  output: {
    file: `dist/sfctree.umd.js`,
    name: 'sfctree',
    sourcemap: true,
    format: 'umd',
    banner
  },
  plugins: [
    resolve({ browser: true }),  // so Rollup can find external libs
    commonjs(), // so Rollup can convert commonJS to an ES module
    buble()
  ]
}, {
  input: 'demo/index.js',
  output: {
    file: 'demo/bundle.js',
    format: 'iife',
    name: 'name',
    globals: {
      d3: 'd3'
    }
  },
  external: ['d3'],
  plugins: [
    resolve({ browser: true }),  // so Rollup can find external libs
    commonjs(), // so Rollup can convert commonJS to an ES module
    buble()
  ]
}];
