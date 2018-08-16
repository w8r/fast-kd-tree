import morton from 'morton';
import hilbert from './hilbert';
import sort from './sort';

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
  constructor (code, id) {
  //constructor (id) {
    this.code = code;
    this.id   = id;
  }
}

function build (ids, codes, first, last, nodeSize) {
  //if (first === last) return { code: codes[first], id: ids[first] };
  //if (last - first === 0) return new Leaf(codes[first], ids[first]);
  if (last - first <= 10) return new Leaf(codes[first], ids.slice(first, last));
  // if (first === last) return new Leaf(ids[first]);
  const split = findSplit(codes, first, last);
  const left  = build(ids, codes, first, split, nodeSize);
  const right = build(ids, codes, split + 1, last, nodeSize);
  //return { code: split, left, right };
  return new InternalNode(split, left, right);
  //return new InternalNode(left, right);
}

function build (ids, codes, first, last) {
  //if (first === last) return { code: codes[first], id: ids[first] };
  //if (last - first === 0) return new Leaf(codes[first], ids[first]);
  if (last - first === 0) return new Leaf(codes[first], ids[first]);
  // if (first === last) return new Leaf(ids[first]);
  const split = findSplit(codes, first, last);
  const left  = build(ids, codes, first, split);
  const right = build(ids, codes, split + 1, last);
  //return { code: split, left, right };
  return new InternalNode(split, left, right);
  //return new InternalNode(left, right);
}

function __clz(m) {
  let c = 1 << 31, i;
  for (let i = 0; i < 32; i += 1) {
    if (c & m) return i;
    c >>>= 1;
  }
  return 32;
}


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

export default class BVH {

  constructor(points) {
    const n = points.length;
    const codes = new Array(n);
    const ids = new Array(n);
    let minX = Infinity, minY = Infinity;
    for (let i = 0; i < n; i++) {
      const { x, y } = points[i];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
    }

    for (let i = 0; i < n; i++) {
      const p = points[i];
      codes[i] = hilbert(p.x - minX, p.y - minY);
      //codes[i] = hilbert(p.x, p.y);
      ids[i] = i;
    }
    sort(ids, codes);
    const copy = codes.slice();
    for (let i = 0; i < n; i++) codes[i] = copy[ids[i]];
    this._root = build(ids, codes, 0, n - 1);
    this._points = points;
  }


  visit (fn, ctx) {
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
    const result = [];
    let current = this._root;
    const min = hilbert(x0, y0), max = hilbert(x1, y1);
    const Q = [this._root];  /* Initialize stack s */
    while (Q.length !== 0) {
      const node = Q.pop();
      if (min <= node.code && node.code <= max) {
        if (node.id !== undefined) {
          const pt = this._points[node.id];
          node.checked = true;
          if (x0 <= pt.x && pt.x <= x1 && y0 <= pt.y && pt.y <= y1) {
            result.push(node.id);
          }
        } else {
          if (node.left)  Q.push(node.left);
          if (node.right) Q.push(node.right);
        }
      }
    }
    return result;
  }

  toString(printNode = (n) => n.code) {
    return print(this._root, printNode);
  }
}


function print (root, printNode = (n) => n.code) {
  var out = [];
  row(root, '', true, (v) => out.push(v), printNode);
  return out.join('');
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
