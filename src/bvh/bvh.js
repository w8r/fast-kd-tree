import morton  from './morton';
import hilbert from './hilbert';
import sort    from './sort';

import InternalNode from './internal_node';
import { Leaf, BucketLeaf } from './leaf';
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

  return new InternalNode(split, left, right);
}


function build (data, ids, codes, first, last) {
  if (last - first === 0) return new Leaf(codes[first], data[ids[first]]);
  const split = findSplit(codes, first, last);
  //const split = first + ((last - first) >> 1);
  const left  = build(data, ids, codes, first, split);
  const right = build(data, ids, codes, split + 1, last);
  return new InternalNode(split, left, right);
}


class Node {
  constructor (code) {
    this.code   = code;
    this.left   = null;
    this.right  = null;
    this.data   = null;
  }
}


function buildIterative (data, ids, codes, start, end) {
  let root    = new Node(null);
  const Q     = [root];
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
      //const split = (first + last) >> 1;
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
  const Q = [root];
  const stack = [start, end];

  while (Q.length !== 0) {
    const last  = stack.pop();
    const first = stack.pop();
    const node  = Q.pop();

    if (last - first < bucketSize) {
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


// count leading zeroes
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

  if (f === l) return first;

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
  } while (step > 1);
  return split;
}


const defaultX = p => p.x;
const defaultY = p => p.y;


/**
 * @public
 */
export default class BVH {

  /**
   * @constructor
   * @param  {Array<*>} points
   * @param  {CoordGetter}   getX
   * @param  {CoordGetter}   getY
   * @param  {Number}   bucketSize
   * @param  {Number}   sfc
   */
  constructor (points, {
    getX = defaultX,
    getY = defaultY,
    bucketSize = 0,
    sfc = HILBERT,
    recursive = true
  } = {}) {
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

    this._minX = minX;
    this._minY = minY;
    this._maxX = maxX;
    this._maxY = maxY;

    const max = (1 << 16) - 1;
    const dx = Math.max(maxX - minX, 1);
    const dy = Math.max(maxY - minY, 1);

    const w = max / dx;
    const h = max / dy;

    // division by zero safety
    this._hw = w;
    this._hh = h;

    for (i = 0; i < n; i++) {
      p = points[i];
      codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
    }
    sort(ids, codes);

    if (bucketSize === 0) {
      this._root = recursive
        ? build(points, ids, codes, 0, n - 1)
        : buildIterative(points, ids, codes, 0, n - 1);
    } else {
      this._root = recursive
        ? buildBuckets(points, ids, codes, 0, n - 1, bucketSize)
        : buildIterativeBuckets(points, ids, codes, 0, n - 1, bucketSize);
    }
    /** @type {Number} */
    this._bucketSize = bucketSize;
  }

  get root() {
    return this._root;
  }
}


BVH.prototype.inOrder   = inOrder;
BVH.prototype.preOrder  = preOrder;
BVH.prototype.postOrder = postOrder;
BVH.prototype.map       = map;
BVH.prototype.height    = height;
BVH.prototype.size      = size;
BVH.prototype.toString  = toString;

BVH.SFC = { HILBERT, MORTON };
