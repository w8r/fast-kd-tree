import morton     from 'morton';
import hilbert    from './hilbert.js';
import sort       from './sort.js';

import InternalNode from './internal_node.js';
import { Leaf, BucketLeaf } from './leaf.js';
import {
  map, preOrder, postOrder, inOrder,
  height, size, toString
} from './traversals';

const HILBERT = 1;
const MORTON  = 0;

/**
 * @typedef {function(*):Number} CoordGetter
 */


function buildBuckets (data, ids, codes, first, last, bucketSize) {
  if (last - first <= bucketSize) {
    const bucket = new Array(last - first + 1);
    for (let i = first, j = 0; i <= last; i++, j++) bucket[j] = data[ids[i]];
    return new BucketLeaf(codes[first], bucket);
  }
  const split = findSplit(codes, first, last);
  const left  = buildBuckets(data, ids, codes, first, split, bucketSize);
  const right = buildBuckets(data, ids, codes, split + 1, last, bucketSize);

  // const nd = [left, right];
  // nd.left = left; nd.right = right;
  // return nd;
  return new InternalNode(split, left, right);
}


function build (data, ids, codes, first, last) {
  if (last - first === 0) return new Leaf(codes[first], data[ids[first]]);
  const split = findSplit(codes, first, last);
  //const split = first + ((last - first) >> 1);
  const left  = build(data, ids, codes, first, split);
  const right = build(data, ids, codes, split + 1, last);
  // const nd = [left, right];
  // nd.left = left; nd.right = right;
  // return nd;
  return new InternalNode(split, left, right);
}


class Node {
  constructor (parent) {
    this.code   = 0;
    this.parent = parent;
    this.left   = null;
    this.right  = null;
    this.data   = null;
  }
}


function buildIterative (data, ids, codes, start, end) {
  let root = new Node(null);
  let parent = null;
  const Q = [root];
  const stack = [start, end];

  while (Q.length !== 0) {
    const last  = stack.pop();
    const first = stack.pop();
    const node  = Q.pop();

    if (last - first === 0) {
      node.code = codes[first];
      node.data = data[ids[first]];
    } else {
      const split = findSplit(codes, first, last);
      node.code = split;

      if (first <= split) {
        node.left = new Node(split, node);
        Q.push(node.left);
        stack.push(first, split);
      }

      if (last > split) {
        node.right = new Node(node);
        Q.push(node.right);
        stack.push(split + 1, last);
      }
    }
  }
  return root;
}


function buildIterativeBuckets (data, ids, codes, start, end, bucketSize) {
  let root = new Node(null);
  let parent = null;
  const Q = [root];
  const stack = [start, end];

  while (Q.length !== 0) {
    const last  = stack.pop();
    const first = stack.pop();
    const node  = Q.pop();

    if (last - first <= bucketSize) {
      const bucket = new Array(last - first + 1);
      for (let i = first, j = 0; i <= last; i++, j++) bucket[j] = data[ids[i]];
      node.code = codes[first];
      node.data = bucket;
    } else {
      const split = findSplit(codes, first, last);
      node.code = split;

      if (first <= split) {
        node.left = new Node(split, node);
        Q.push(node.left);
        stack.push(first, split);
      }

      if (last > split) {
        node.right = new Node(node);
        Q.push(node.right);
        stack.push(split + 1, last);
      }
    }
  }
  return root;
}


function __clz(m) {
  let c = 1 << 31;
  for (let i = 0; i < 31; i += 1) {
    if (c & m) return i;
    c >>>= 1;
  }
  return 32;
}


// https://devblogs.nvidia.com/thinking-parallel-part-iii-tree-construction-gpu/
function findSplit (codes, first, last) {
  const f = codes[first];
  const l = codes[last];

  if (f === l) return (first + last) >> 1;

  // Calculate the number of highest bits that are the same
  // for all objects, using the count-leading-zeros intrinsic.
  const commonPrefix = __clz(f ^ l);

  // Use binary search to find where the next bit differs.
  // Specifically, we are looking for the highest object that
  // shares more than commonPrefix bits with the first one.

  let split = first; // initial guess
  let step = last - first, newSplit, splitCode, splitPrefix;

  do {
    step = (step + 1) >> 1; // exponential decrease
    newSplit = split + step; // proposed new position

    if (newSplit < last) {
      splitCode = codes[newSplit];
      splitPrefix = __clz(f ^ splitCode);
      if (splitPrefix > commonPrefix) split = newSplit; // accept proposal
    }
  } while (step > 1)
  return split;
}


const defaultX = p => p.x;
const defaultY = p => p.y;

/**
 * @public
 */
export default class PHTree {

  /**
   * @constructor
   * @param  {Array<*>} points
   * @param  {CoordGetter}   getX
   * @param  {CoordGetter}   getY
   * @param  {Number}   bucketSize
   * @param  {Number}   sfc
   */
  constructor (points, getX = defaultX, getY = defaultY, bucketSize = 0, sfc = HILBERT) {
    const n     = points.length;
    const codes = new Uint32Array(n);
    let minX = Infinity, minY = Infinity,
        maxX = -Infinity, maxY = -Infinity;
    let p, i, x, y;

    /** @type {CoordGetter} */
    this._x = getX;
    /** @type {CoordGetter} */
    this._y = getY;

    const project = sfc === HILBERT ? hilbert : morton;
    this._project = project;

    const ids = new Uint32Array(n);

    for (i = 0; i < n; i++) {
      p = points[i];
      x = getX(p);
      y = getY(p);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      ids[i] = i;
    }

    /** @type {Number} */
    this._minX = minX;
    /** @type {Number} */
    this._minY = minY;
    /** @type {Number} */
    this._maxX = maxX;
    /** @type {Number} */
    this._maxY = maxY;

    const max = (1 << 16) - 1;
    const w = max / (maxX - minX);
    const h = max / (maxY - minY);
    this._hw = w;
    this._hh = h;

    for (i = 0; i < n; i++) {
      p = points[i];
      codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
    }
    sort(ids, codes);

    if (bucketSize === 0) {
      /** @type {InternalNode?} */
      this._root = buildIterative(points, ids, codes, 0, n - 1);
      //this._root = build(points, ids, codes, 0, n - 1);
    } else {
      /** @type {InternalNode?} */
      this._root = buildIterativeBuckets(points, ids, codes, 0, n - 1, bucketSize);
    }
    /** @type {Number} */
    this._bucketSize = bucketSize;
  }


  walk (fn) {
    const stack = [this._minX, this._minY, this._maxX, this._maxY, 0];
    const Q = [this._root];

    let i = 0, j = 0;
    while (Q.length !== 0) {
      const node = Q.pop();

      const dir  = stack.pop();
      const ymax = stack.pop();
      const xmax = stack.pop();
      const ymin = stack.pop();
      const xmin = stack.pop();

      if (node) {
        if (fn(node, xmin, ymin, xmax, ymax)) break;
        const hw = (xmax - xmin) / 2,
              hh = (ymax - ymin) / 2;
        //const nextDir = dir > 0 ? (dir - 1) : 3;
        const nextDir = (dir + 1) % 2;

        Q.push(node.left, node.right)

        if (nextDir) { // by x
          stack.push(xmin, ymin, xmin + hw, ymax, nextDir);
          stack.push(xmin + hw, ymin, xmax, ymax, nextDir);
        } else {       // by y
          stack.push(xmin, ymin + hh, xmax, ymax, nextDir);
          stack.push(xmin, ymin, xmax, ymin + hh, nextDir);
        }
      }
    }
    return this;
  }


  query (x0, y0, x1, y1) {
    const res = [];
    this.walk((n, xmin, ymin, xmax, ymax) => {
      if (n.data) res.push(n.data);
      return !(xmax > x0 && xmin < x1) && (ymax > y0 && ymin < y1);
    });
    return res;
  }
}


PHTree.prototype.inOrder   = inOrder;
PHTree.prototype.preOrder  = preOrder;
PHTree.prototype.postOrder = postOrder;
PHTree.prototype.map       = map;
PHTree.prototype.height    = height;
PHTree.prototype.size      = size;
PHTree.prototype.toString  = toString;

PHTree.SFC = { HILBERT, MORTON };
