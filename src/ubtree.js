import BST from 'splaytree';
import morton from 'morton';
import hilbert from './hilbert';

import {
  map, preOrder, postOrder, inOrder,
  height, size, toString
} from './traversals';


const defaultGetX = d => d.x;
const defaultGetY = d => d.y;

const HILBERT = 1;
const MORTON = 2;


export default class UBTree {

	constructor (data, getX = defaultGetX, getY = defaultGetY, sfc = HILBERT) {
		this._tree = new BST();

    const n = data.length;
    let minX = Infinity, minY = Infinity,
        maxX = -Infinity, maxY = -Infinity;
    let p, i, x, y;

    this._x = getX;
    this._y = getY;

    const project = sfc === HILBERT ? hilbert : morton;
    this._project = project;

    for (i = 0; i < n; i++) {
      p = data[i];
      x = getX(p);
      y = getY(p);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    this._minX = minX;
    this._minY = minY;
    this._maxX = maxX;
    this._maxY = maxY;

    const max = (1 << 16) - 1;
    const w = max / (maxX - minX);
    const h = max / (maxY - minY);

		for (i = 0; i < n; i++) {
			p = data[i];
			this._tree.insert(project(w * (getX(p) - minX), h * (getY(p) - minY)), p);
		}

		this._root = this._tree._root;
	}
}


UBTree.prototype.inOrder   = inOrder;
UBTree.prototype.preOrder  = preOrder;
UBTree.prototype.postOrder = postOrder;
UBTree.prototype.map       = map;
UBTree.prototype.height    = height;
UBTree.prototype.size      = size;
UBTree.prototype.toString  = toString;