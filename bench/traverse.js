import Benchmark from 'benchmark';
import options from './options';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import SFC from '../src/sfc-tree.js';
import sort from '../src/sort';
import sq from '../src/generic-quadtree';
import LQ from '../src/linear-quadtree';
import skd from '../src/kdtree';
import UBTree from '../src/ubtree';
import BVH from '../dist/bvh.umd';
import seedrandom from 'seedrandom';
import quadtreebh from 'ngraph.quadtreebh';

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
const P = new BVH(points);
const PB = new BVH(points, { bucketSize: Math.floor(Math.log(N)) });
const U = new UBTree(points);
const QBH = quadtreebh();
QBH.insertBodies(points.map(pos => ({ pos, force: { x: 0, y: 0 }})));

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
}).add('BVH bucketed', () => {
  let i = 0;
  PB.inOrder(() => {
    i++;
  });
}).add('ubtree', () => {
  let i = 0;
  U.inOrder(() => {
    i++;
  });
})
.add('ngraph.quadtree', () => {
  
})
.run();

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
