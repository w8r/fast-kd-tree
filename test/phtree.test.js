import { assert } from 'chai';
import quicksort from '../src/sort';
import BVH from '../src/phtree';


function createPoints(n = 10) {
  return new Array(n).fill(0).map(() => ({
    x: Math.random() * n,
    y: Math.random() * n
  }));
}


describe('sorting', ()=> {
  const t = new Array(10).fill(0).map(() => (Math.random() * 100) | 0);
  //console.log(t, quicksort(t.map((_, i) => i), t.slice()).map(k => t[k]));

});

describe('fast kd-tree', () => {

  it ('bvh', () => {
    const pts = createPoints(10);
    const b = new BVH(pts);
    const arr = [];
    b.preOrder(n => {
      if (n.data) arr.push(n.data);
    });
    assert.equal(arr.length, pts.length);
    arr.forEach(p => assert.include(pts, p));
  });


  it ('recursive/non-recursive', () => {
    const pts = createPoints(10);

    const rec = new BVH(pts, { recursive: true });
    const nrec = new BVH(pts, { recursive: false });

    const a = [], b = [];
    rec.inOrder(n => { if (n.data) a.push(n.data); });
    nrec.inOrder(n =>{ if (n.data) b.push(n.data); });

    assert.deepEqual(a, b);
  });


  it.skip ('recursive/non-recursive bucketed', () => {
    const pts = createPoints(100);
    const bucketSize = Math.floor(Math.log(100));

    const rec  = new BVH(pts, { recursive: true, bucketSize });
    const nrec = new BVH(pts, { recursive: false, bucketSize });

    const a = [], b = [];
    rec.inOrder(n => { if (n.data) a.push(n.data); });
    nrec.inOrder(n =>{ if (n.data) b.push(n.data); });

    assert.deepEqual(a, b);
  });


  it ('pre-order', () => {
    const pts = createPoints(10);
    const t = new BVH(pts);
    const root = t._root;

    const codes = [], check = [];
    const rec = (n) => {
      if (n) {
        check.push(n.code);
        rec(n.left);
        rec(n.right);
      }
    }

    t.preOrder(n => { codes.push(n.code); });
    rec(t._root);

    assert.deepEqual(codes, check);
  });


  it ('in-order', () => {
    const pts = createPoints(10);
    const t = new BVH(pts);
    const root = t._root;

    const codes = [], check = [];
    const rec = (n) => {
      if (n) {
        rec(n.left);
        check.push(n.code);
        rec(n.right);
      }
    }

    t.inOrder(n => { codes.push(n.code); });
    rec(t._root);

    assert.deepEqual(codes, check);
  });

  it ('post-order', () => {
    const pts = createPoints(10);
    const t = new BVH(pts);
    const root = t._root;

    const codes = [], check = [];
    const rec = (n) => {
      if (n) {
        rec(n.left);
        rec(n.right);
        check.push(n.code);
      }
    }

    t.postOrder(n => { codes.push(n.code); });
    rec(t._root);

    assert.deepEqual(codes, check);
  });
});

