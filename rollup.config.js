import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';

const plugins = [nodeResolve(), buble()];
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
