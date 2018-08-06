import Benchmark from 'benchmark';
import { quadtree } from 'd3';
import kdbush from 'kdbush';
import KDTree from './';
import sort from './sort';


const N = 10000;
const points = new Array(N).fill(0).map((_, i) => {
  if (i < N / 2) {
    return { x: Math.random() * N / 100, y: Math.random() * N / 100 };
  } else {
    return { x: Math.random() * N, y: Math.random() * N };
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


new Benchmark.Suite(` build from ${N} points`, options)
.add('d3-quadtree', () => {
  const q = quadtree(points, p => p.x, p => p.y);
}).add('mourner/kdbush', () => {
  const kd = kdbush(points, p => p.x, p => p.y, 1);
}).add('current kd-tree', () => {
  const kd = new KDTree(points, p => p.x, p => p.y);
}).run();

const rand = new Array(N).fill(0).map(() => (Math.random() * N) | 0);
const indexes = rand.map((_, i) => i);
new Benchmark.Suite('sort', options)
.add('built-in', () => {
  indexes.slice().sort((a, b) => rand[a] - rand[b]);
}).add('quick', () => {
  sort(indexes.slice(), rand);
}).run();
