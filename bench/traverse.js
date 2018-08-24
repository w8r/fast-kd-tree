import Benchmark from 'benchmark';
import options from './options';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import SFC from '../src/sfc-tree.js';
import sort from '../src/sort';
import sq from '../src/generic-quadtree';
import LQ from '../src/linear-quadtree';
import skd from '../src/kdtree';
import PH from '../dist/phtree.umd';
import seedrandom from 'seedrandom';

const rnd = seedrandom('bench');

const N = 10000;
const points = new Array(N).fill(0).map((_, i) => {
  if (i < N / 2) {
    return { x: rnd() * N / 100, y: rnd() * N / 100 };
  } else {
    return { x: rnd() * N, y: rnd() * N };
  }
});

const Q = quadtree(points, p => p.x, p => p.y);
const P = new PH(points);

new Benchmark.Suite(` visit tree of ${N} points`, options)
.add('d3 quadtree', () => {
  let i = 0;
  Q.visitAfter(() => i++);
})
.add('ph', () => {
  let i = 0;
  P.inOrder(() => {
    i++;
  });
}).run();

(() => {
  const rand = new Array(N).fill(0).map(() => (Math.random() * N) | 0);
  const indexes = rand.map((_, i) => i);
  new Benchmark.Suite('sort', options)
  .add('built-in', () => {
    indexes.slice().sort((a, b) => rand[a] - rand[b]);
  }).add('quick', () => {
    sort(indexes.slice(), rand);
  });
})();
