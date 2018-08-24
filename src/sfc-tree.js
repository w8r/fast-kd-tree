import sort from './sort';
import hilbert from './hilbert';
import morton from 'morton';
import InternalNode from './internal_node';
import { BucketLeaf, Leaf } from './leaf';
import { inOrder, preOrder, postOrder, map } from './traversals';


const defaultX = d => d.x;
const defaultY = d => d.y;


function build (data, ids, codes, first, last) {
  if (last - first === 0) return new Leaf(codes[first], data[ids[first]]);
  const split = (last + first) >> 1;
  const left  = build(data, ids, codes, first, split);
  const right = build(data, ids, codes, split + 1, last);
  // const nd = [left, right];
  // nd.left = left; nd.right = right;
  // return nd;
  return new InternalNode(split, left, right);
}

/**
 * This is a very interesting decomposition:
 * It splits by equal spans on the space-filling curve.
 * It's super-fast, but the zones are of irregular shapes (tetris-like).
 * It gets worse if you use morton curve.
 */
export default class SFCTree {
  constructor (points, getX = defaultX, getY = defaultY, bucketSize = 0) {
    this._x = getX;
    this._y = getY;
    this._bucketSize = bucketSize;
    this.buildHilbert(points);
    //this.build(points);
  }


  buildHilbert(points) {
    const n       = points.length;
    const hvalues = new Array(n);
    const order   = new Array(n);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < n; i++) {
      const p = points[i];
      const x = this._x(p), y = this._y(p)
      hvalues[i] = hilbert(x, y);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      order[i]  = i;
    }
    sort(order, hvalues);

    // this._list = toList(points, order, hvalues, this._x, this._y);
    // this._root = sortedListToBST({ head: this._list }, 0, n);
    this._minX = minX;
    this._minY = minY;
    this._maxX = maxX;
    this._maxY = maxY;

    this._root = build(points, order, hvalues, 0, n - 1);

    let node = this._list;
    // while (node) {
    //   node.xmin = node.ymin = Infinity;
    //   node.xmax = node.ymax = -Infinity;
    //   node = node.next;
    // }

    node = this._list;
    // while (node) {
    //   const parent = node.parent;
    //   const xn = x(node.point), yn = y(node.point);
    //   if (parent) {
    //     if (xn < parent.xmin) parent.xmin = xn;
    //     if (yn < parent.ymin) parent.ymin = yn;
    //     if (xn > parent.xmax) parent.xmax = xn;
    //     if (yn > parent.ymax) parent.ymax = yn;
    //   }
    //   node = node.next;
    // }
  }

  // build (points) {
  //   const n = points.length;
  //   const x = this._x, y = this._y;
  //   const indexes = new Array(n);
  //   const X = new Array(n), Y = new Array(n);
  //   for (let i = 0; i < n; i++) {
  //     const p = points[i];
  //     X[i] = x(p); Y[i] = y(p); indexes[i] = i;
  //   }
  //   const byX = sort(indexes.slice(), X);
  //   const byY = sort(indexes.slice(), Y);


  // }

  // _build (points, order, start, end) {
  //   if (start === end) { // leaf
  //     return { point: points[start], parent: null, left: null, right: null };
  //   } else {
  //     const med = Math.floor((start + end) / 2);
  //     const root = { points[med]
  //   }

  // }


  query (xmin, ymin, xmax, ymax) {
    const qmin = hilbert(xmin, ymin), qmax = hilbert(xmax, ymax);
    const result = [];

    // this.range(qmin, qmax, (node) => {
    //   const x = this._x(node.point), y = this._y(node.point);
    //   if (x <= xmax && x >= xmin && y <= ymax && y >= ymin) {
    //     result.push(node.point);
    //   }
    // });

    return result;


    // const Q = [this._root];
    // const result = [];
    // while (Q.length !== 0) {
    //   const node = Q.pop();
    //   if (node) {
    //     const x = this._x(node.point), y = this._y(node.point);
    //     if (x <= xmax && x >= xmin && y <= ymax && y >= ymin) {
    //       result.push(node.point);
    //     }
    //     const { left, right } = node;
    //     if (left  && left.code  >= qmin) Q.push(left);
    //     if (right && right.code <= qmax) Q.push(right);
    //     console.log(node.code, node.left, node.right, qmin, qmax);
    //   }
    // }
    // return result;
  }


  range (low, high, fn, ctx) {
    const Q = [];
    let node = this._root;

    while (Q.length !== 0 || node) {
      if (node) {
        Q.push(node);
        node = node.left;
      } else {
        node = Q.pop();
        if (node.code > high) {
          break;
        } else if (node.code >= low) {
          if (fn.call(ctx, node)) return this; // stop if smth is returned
        }
        node = node.right;
      }
    }
    return this;
  }
}

SFCTree.prototype.inOrder   = inOrder;
SFCTree.prototype.preOrder  = preOrder;
SFCTree.prototype.postOrder = postOrder;
SFCTree.prototype.map       = map;


function toList (nodes, order, codes, x, y) {
  const list = { next: null };
  let prev = list;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[order[i]];
    //const cx = x(node), cy = y(node);

    prev = prev.next = node;
  }
  prev.next = null;
  return list.next;
}


function sortedListToBST (list, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + (size >> 1);
    const left = sortedListToBST(list, start, middle);

    const root = list.head;
    root.left = left;
    if (root.left) root.left.parent = root;

    list.head = list.head.next;

    root.right = sortedListToBST(list, middle + 1, end);
    if (root.right) root.right.parent = root;
    return root;
  }

  return null;
}


function sortedListToBST (list, first, last) {
  const size = last - first;
  if (size === 0) return list.head;
  const split = first + (size >> 1);
  const left  = sortedListToBST(list, first, split);
  list.head = list.head.next;
  const right = sortedListToBST(list, split + 1, last);
  // const node = [left, right];
  // node.code = split;
  // return node;
  return { left, right };
}
