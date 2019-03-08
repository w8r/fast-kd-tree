import sort from './sort';
import hilbert from './hilbert';
import morton from 'morton';
import InternalNode from './internal_node';
import { BucketLeaf, Leaf } from './leaf';
import {
  map, preOrder, postOrder, inOrder,
  height, size, toString
} from './traversals';
import {
  __clz,
  findSplit
} from './bvh';

const defaultX = d => d.x;
const defaultY = d => d.y;

const NSIZE = 3;
function build (data, ids, codes, first, last, storage, id) {
  if (last - first === 0) {
    //console.log(id, ids[first]);
    storage[id * NSIZE]     = id;
    storage[id * NSIZE + NSIZE - 1] = ids[first];
    return;
    //return new Leaf(codes[first], data[ids[first]]);
  }
  const split = findSplit(codes, first, last);
  //const split = (last + first) >> 1;
  const left  = build(data, ids, codes, first,     split, storage, id * 2 + 1);
  const right = build(data, ids, codes, split + 1, last,  storage, id * 2 + 2);

  storage[id * NSIZE] = id;
  // storage[id * 4 + 1] = id * 2 + 1;
  // storage[id * 4 + 2] = id * 2 + 2;
  // const nd = [left, right];
  // nd.left = left; nd.right = right;
  // return nd;
  return;
  //return new InternalNode(split, left, right);
}

function build (data, ids, codes, start, end, storage, id) {
  const stack = [id, start, end];

  while (stack.length !== 0) {
    const last  = stack.pop();
    const first = stack.pop();
    const node  = stack.pop();
    storage[node * NSIZE] = node;

    if (last - first === 0) {
      storage[node * NSIZE] = node;
      storage[node * NSIZE + NSIZE - 1] = ids[first];
      // node.code = codes[first];
      // node.data = data[ids[first]];
    } else {
      const split = findSplit(codes, first, last);
      //const split = (first + last) >> 1;
      //node.code = split;

      if (first <= split) {
        stack.push(node * 2 + 1);
        stack.push(first, split);
      }

      if (last > split) {
        stack.push(node * 2 + 2);
        stack.push(split + 1, last);
      }
    }
  }
}

/**
 * This is a very interesting decomposition:
 * It splits by equal spans on the space-filling curve.
 * It's super-fast, but the zones are of irregular shapes (tetris-like).
 * It gets worse if you use morton curve.
 */
export default class ArrayTree {

  constructor (points, { getX = defaultX, getY = defaultY, bucketSize = 0 }) {
    const n       = points.length;
    const hvalues = new Array(n);
    const order   = new Array(n);
    const storage = new Int32Array(Math.pow(2, Math.ceil(Math.log2(n) + 1)) * NSIZE);
    const indexes = new Int32Array();

    storage.fill(-1);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < n; i++) {
      const p = points[i];
      const x = getX(p), y = getY(p)
      hvalues[i] = hilbert(x, y);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      order[i]  = i;
      indexes[i] = i;
    }
    sort(order, hvalues);

    // this._list = toList(points, order, hvalues, this._x, this._y);
    // this._root = sortedListToBST({ head: this._list }, 0, n);
    this._minX = minX;
    this._minY = minY;
    this._maxX = maxX;
    this._maxY = maxY;

    this._x = getX;
    this._y = getY;
    this._bucketSize = bucketSize;

    this._root = build(points, order, hvalues, 0, n - 1, storage, 0);
    this._storage = storage;
  }

  query () { return [] }

  inOrder (fn, ctx) {
    let current = 0;
    const Q = [];
    let done = false;

    while (!done) {
      if (current !== -1) {
        Q.push(current);
        current = current * 2 + 1;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          if (fn.call(ctx, storage[current * NSIZE + NSIZE - 1])) break;
          current = current * 2 + 2;
        } else done = true;
      }
    }
    return this;
  }


  preOrder (fn, ctx) {
    const Q = [0];
    while (Q.length !== 0)  {
      const node = Q.pop();
      if (!fn.call(ctx, node)) {
        if (node.right) Q.push(node.right);
        if (node.left)  Q.push(node.left);
      }
    }
    return this;
  }


  postOrder (fn, ctx) {
    const Q = [];
    let node = this._root, last;
    do {
      while (node) {
        if (node.right) Q.push(node.right);
        Q.push(node);
        node = node.left;
      }
      node = Q.pop();
      last = Q.length - 1;
      if (node.right && Q[last] === node.right) {
        Q[last] = node;
        node = node.right;
      } else {
        fn.call(ctx, node);
        node = null;
      }
    } while (Q.length !== 0);

    return this;
  }


  map (fn, ctx) {
    const res = [];
    this.inOrder(node => {
      res.push(fn.call(ctx, node));
    });
    return res;
  }
}


ArrayTree.prototype.inOrder   = inOrder;
// ArrayTree.prototype.preOrder  = preOrder;
// ArrayTree.prototype.postOrder = postOrder;
// ArrayTree.prototype.map       = map;
ArrayTree.prototype.height    = height;
ArrayTree.prototype.size      = size;
ArrayTree.prototype.toString  = toString;
