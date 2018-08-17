import Benchmark from 'benchmark';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import KDTree from './src/hilbert-bst.js';
import sort from './src/sort';
import sq from './src/generic-quadtree';
import skd from './src/kdtree';
import PH from './dist/phtree.umd';
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

const options = {
  onStart (event) { console.log(this.name); },
  onError (event) { console.log(event.target.error); },
  onCycle (event) {
    console.log(' -', String(event.target), `mean ${(event.target.stats.mean * 1000).toFixed(3)}ms`);
  },
  onComplete() {
    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n');
  }
};

(() => {
  new Benchmark.Suite(` build from ${N} points`, options)
  .add('d3-quadtree', () => {
    const q = quadtree(points, p => p.x, p => p.y);
  }).add('PH', () => {
    const b = new PH(points);
  }).add('mourner/kdbush', () => {
    const kd = kdbush(points, p => p.x, p => p.y, 1);
  // }).add('simple kd', () => {
  //   const q = new skd(points);
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
  }).add('hilbert range-tree', () => {
    const kd = new KDTree(points, p => p.x, p => p.y);
  }).run();
})();

(() => {
  const Q = quadtree(points, p => p.x, p => p.y);
  const P = new PH(points);

  new Benchmark.Suite(` visit tree of ${N} points`, options)
  .add('d3 quadtree', () => {
    let i = 0;
    Q.visitAfter(() => i++);
  })
  .add('ph', () => {
    let i = 0;
    P.visit(() => {
      i++;
    });
  }).run();
})();

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
