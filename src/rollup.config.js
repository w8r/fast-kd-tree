import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [nodeResolve(), commonjs(), buble()];
export default [{
  input: 'demo.js',
  output: {
    name: 'kdbush',
    format: 'iife',
    indent: false,
    file: 'vis.js'
  },
  plugins
}];
