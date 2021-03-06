import Benchmark from 'benchmark';
import options from './options';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import SFC from '../src/sfc-tree.js';
import sort from '../src/sort';
import sq from '../src/generic-quadtree';
import LQ from '../src/linear-quadtree';
import skd from '../src/kdtree';
import DynamicKDTree from '../src/dynamic-kdtree';
import kdt from '../src/kdt';
import PH from '../dist/phtree.umd';
import UB from '../src/ubtree';
import seedrandom from 'seedrandom';
import { binarytree } from 'd3-binarytree';
import hilbert from '../src/hilbert';

const rnd = seedrandom('bench');

const N = 100000;
const points = new Array(N).fill(0).map((_, i) => {
  if (i < N / 2) {
    return { x: rnd() * N / 100, y: rnd() * N / 100 };
  } else {
    return { x: rnd() * N, y: rnd() * N };
  }
});

points.forEach(p => {
  p.code = hilbert(p.x, p.y);
});


new Benchmark.Suite(` build from ${N} points`, options)
.add('d3-quadtree', () => {
  const q = quadtree(points, p => p.x, p => p.y);
}).add('PH', () => {
  const b = new PH(points, p => p.x, p => p.y);
}).add('PH-morton', () => {
  const b = new PH(points, p => p.x, p => p.y, 0, PH.SFC.MORTON);
}).add('PH reduced (bucket)', () => {
  const b = new PH(points, p => p.x, p => p.y, Math.floor(Math.log(N)));
}).add('mourner/kdbush', () => {
  const kd = kdbush(points, p => p.x, p => p.y, 1);
}).add('simple kd', () => {
  const q = new skd(points);
}).add('in-place kdtree', () => {
  const k = new kdt(points);
}).add('UB-tree', () => {
  const u = new UB(points);
}).add('d3-binarytree', () => {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    p.code = hilbert(p.x, p.y);
  }
  const d = binarytree().x(p => p.code).addAll(points);
}).add('dynamic kd-tree', () => {
  const dkd = new DynamicKDTree(points, d => d.x, d => d.y);
}).add('double-sort', () => {
  const X = new Array(points.length);
  const Y = new Array(points.length);
  const byX = new Array(points.length), byY = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    X[i] = x; Y[i] = y;
    byX[i] = byY[i] = i;
  }
  sort(byX, X);
  sort(byY, Y);
}).add('simple q', () => {
  const q = new sq(points);
}).add('linear-quadtree', () => {
  const lq = new LQ(points);
}).add('sfc tree', () => {
  const sfc = new SFC(points, p => p.x, p => p.y);
}).run();
