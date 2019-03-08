import sort from './sort';
import hilbert from './hilbert';
import morton from 'morton';
import InternalNode from './internal_node';
import { BucketLeaf, Leaf } from './leaf';
import {
  map, preOrder, postOrder, inOrder,
  height, size, toString
} from './traversals';


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

  constructor (points, { getX = defaultX, getY = defaultY, bucketSize = 0 }) {
    const n       = points.length;
    const hvalues = new Array(n);
    const order   = new Array(n);

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

    this._root = build(points, order, hvalues, 0, n - 1);
  }

  query () { return [] }
}


SFCTree.prototype.inOrder   = inOrder;
SFCTree.prototype.preOrder  = preOrder;
SFCTree.prototype.postOrder = postOrder;
SFCTree.prototype.map       = map;
SFCTree.prototype.height    = height;
SFCTree.prototype.size      = size;
SFCTree.prototype.toString  = toString;
