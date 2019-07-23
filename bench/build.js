import Benchmark from 'benchmark';
import options from './options';
import { quadtree } from 'd3-quadtree';
import kdbush from 'kdbush';
import SFC from '../src/sfc-tree.js';
import sort from '../src/sort';
import sq from '../src/generic-quadtree';
import LQ from '../src/linear-quadtree';
import hilbertquad from '../src/bottom-up';
import skd from '../src/kdtree';
import DynamicKDTree from '../src/dynamic-kdtree';
import kdt from '../src/kdt';
import BVH from '../dist/phtree.umd';
import BVHTS from '../dist/bvh-ts';
import AVH from '../src/array-tree';
import UB from '../src/ubtree';
import seedrandom from 'seedrandom';
import qtreebh from 'ngraph.quadtreebh';

const rnd = seedrandom('bench');

const N = 10000;
const points = new Array(N).fill(0).map((_, i) => {
  if (i < N / 2) {
    return { x: rnd() * N / 100, y: rnd() * N / 100 };
  } else {
    return { x: rnd() * N, y: rnd() * N };
  }
});

const pointsbh = points.map(pos => {
  return { pos, force: { x: 0, y: 0 } };
});

const getX = d => d.x;
const getY = d => d.y;

new Benchmark.Suite(` build from ${N} points`, options)
.add('d3-quadtree', () => {
  const q = quadtree(points, p => p.x, p => p.y);
}).add('AVH', () => {
  const a = new AVH(points, { recursive: false });
}).add('BVH', () => {
  const b = new BVH(points, { recursive: false });
}).add('BVH-recursive', () => {
  const b = new BVH(points);
}).add('BVH-morton', () => {
  const b = new BVH(points, { sfc: BVH.SFC.MORTON });
}).add('BVH reduced (bucket)', () => {
  const b = new BVH(points, { bucketSize: Math.floor(Math.log(N)) });
}).add('BVH-ts reduced (bucket)', () => {
  const b = new BVHTS(points, { getX, getY, bucketSize: Math.floor(Math.log(N)) });
}).add('mourner/kdbush', () => {
  const kd = kdbush(points, p => p.x, p => p.y, 1);
}).add('complete hilbert quadtree', () => {
  const ct = new hilbertquad(points, { getX: p => p.x, getY: p => p.y });
}).add('hgraph.quadtreebh', () => {
  const q = qtreebh();
  q.insertBodies(pointsbh);
}).add('simple kd', () => {
  const q = new skd(points);
}).add('in-place kdtree', () => {
  const k = new kdt(points);
}).add('UB-tree', () => {
  const u = new UB(points);
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
  const sfc = new SFC(points, { getX: p => p.x,  getY: p => p.y });
}).run();
