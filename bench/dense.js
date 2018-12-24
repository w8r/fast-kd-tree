import Benchmark from 'benchmark';
import options from './options';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import PH from '../src/bvh/bvh';

import seedrandom from 'seedrandom';

const rnd = seedrandom('bench');

const N = 100000;
const points = new Array(N).fill(0).map((_, i) => {
  return { x: 1, y: 1 };
});

// points.forEach(p => {
//   p.code = hilbert(p.x, p.y);
// });


new Benchmark.Suite(` build degenerated from ${N} points`, options)
.add('d3-quadtree', () => {
  const q = quadtree(points, p => p.x, p => p.y);
}).add('PH', () => {
  const b = new PH(points, { getX: p => p.x, getY: p => p.y });
}).add('PH non-recursive', () => {
  const b = new PH(points, { getX: p => p.x, getY: p => p.y, recursive: false });
}).add('PH - bucketed', () => {
  const b = new PH(points, { getX: p => p.x, getY: p => p.y, bucketSize: Math.floor(Math.log(N)) });
}).run();
