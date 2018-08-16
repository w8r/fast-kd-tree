import KDTree, { quicksort } from './';
import BVH from './bvh';

describe('sorting', ()=> {
  const t = new Array(10).fill(0).map(() => (Math.random() * 100) | 0);
  //console.log(t, quicksort(t.map((_, i) => i), t.slice()).map(k => t[k]));

});

describe('fast kd-tree', () => {

  it ('bvh', () => {
    const n = 10;
    const pts = new Array(n).fill(0).map(() => ({
      x: Math.random() * n,
      y: Math.random() * n
    }))
    const b = new BVH(pts);
    b.visit(n => {
      if (n.id !== undefined) console.log(pts[n.id]);
    });

    console.log(b.toString());
    console.log(b.query(0, 0, 5, 5).map(i => pts[i]));
    console.log(pts.filter(({ x, y }) => {
      return (x >= 0 && x <= 5 && y >= 0 && y <= 5);
    }));
    let c = 0;
    b.visit(n => c += !!n.checked);
    console.log(c);
  })

  it ('build from a set of points', () => {

  });


  it ('should be balanced', () => {

  });


  it ('traverse', () => {

  });
});
