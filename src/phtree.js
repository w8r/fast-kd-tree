import morton from 'morton';
import hilbert from './hilbert';
import sort from './sort';
import SFCTree from './sfc-tree';

class InternalNode {
  constructor(code, left, right) {
  //constructor(left, right) {
    this.code  = code;
    this.left  = left;
    this.right = right;
    left.parent = right.parent = this;
  }
}

class Leaf {
  constructor (code, data) {
    this.code = code;
    this.data = data;
  }
}

class BucketLeaf {
  constructor (code, data) {
    this.code = code;
    this.data = data;
  }
}


function buildBuckets (data, ids, codes, first, last, bucketSize) {
  if (last - first <= bucketSize) {
    return new BucketLeaf(codes[first], ids.slice(first, last).map(i => data[i]));
  }
  const split = findSplit(codes, first, last);
  const left  = build(data, ids, codes, first, split, bucketSize);
  const right = build(data, ids, codes, split + 1, last, bucketSize);
  const node = [left, right];
  node.code = split;
  return node;
  //return new InternalNode(split, left, right);
}


function build (data, ids, codes, first, last) {
  if (last - first === 0) return new Leaf(codes[first], data[ids[first]]);
  const split = findSplit(codes, first, last);
  const left  = build(data, ids, codes, first, split);
  const right = build(data, ids, codes, split + 1, last);
  // const node = [left, right];
  // node.code = split;
  // return node;
  return new InternalNode(split, left, right);
}


function __clz(m) {
  let c = 1 << 31;
  for (let i = 0; i < 32; i += 1) {
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


export default class PHTree {

  constructor(points, getX = defaultX, getY = defaultY, bucketSize = 0, sfc = 'hilbert') {
    const n     = points.length;
    const codes = new Uint32Array(n);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let p, i, x, y;

    this._x = getX;
    this._y = getY;

    const project = sfc === 'hilbert' ? hilbert : morton;
    this._project = project;

    const ids = new Uint32Array(n);

    //const xz = new Float32Array(n), yz = new Float32Array(n);
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
    const w = max / (maxX - minX);
    const h = max / (maxY - minY);
    this._hw = w;
    this._hh = h;

    for (i = 0; i < n; i++) {
      p = points[i];
      //codes[i] = project(getX(p) - minX, getY(p) - minY);
      codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
    }
    sort(ids, codes);
    //for (let i = 0; i < n; i++) codes[i] = copy[ids[i]];

    if (bucketSize === 0) {
      this._root = build(points, ids, codes, 0, n - 1);
    } else {
      this._root = buildBuckets(points, ids, codes, n - 1, bucketSize);
    }
  }


  visit (fn, ctx) {
    const Q = [this._root];
    while (Q.length !== 0) {
      const node = Q.pop();
      if (node) {
        if (fn.call(ctx, node)) break;
        if (!node.data) {
          Q.push(node.left);
          Q.push(node.right);
        }
      }
    }
    return this;
  }


  visitAfter (fn, ctx) {
    let current = this._root;
    const Q = [];  /* Initialize stack s */
    let done = false;

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          fn.call(ctx, current);
          current = current.right;
        } else done = true;
      }
    }
    return this;
  }


  query (x0, y0, x1, y1) {
    const result = [], Q = [];
    this.visit((node) => {

    });
    return result;
  }

  map (fn, ctx) {
    const res = [];
    this.visitAfter(node => {
      res.push(fn.call(ctx, node));
    });
    return res;
  }


  height () {
    return height(this._root);
  }


  toString (printNode = (n) => n.code) {
    const out = [];
    row(this._root, '', true, (v) => out.push(v), printNode);
    return out.join('');
  }
}


function height (node) {
  return node ? (1 + Math.max(height(node.left), height(node.right))) : 0;
}


/**
 * Prints level of the tree
 * @param  {Node}                        root
 * @param  {String}                      prefix
 * @param  {Boolean}                     isTail
 * @param  {Function(in:string):void}    out
 * @param  {Function(node:Node):String}  printNode
 */
function row (root, prefix, isTail, out, printNode) {
  if (root) {
    out(`${ prefix }${ isTail ? '└── ' : '├── ' }${ printNode(root) }\n`);
    const indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  row(root.left,  indent, false, out, printNode);
    if (root.right) row(root.right, indent, true,  out, printNode);
  }
}

PHTree.SFCTree = SFCTree;
