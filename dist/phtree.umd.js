/**
 * phtree v1.0.0
 * Fast static point hierarchy for particle simulations
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.phtree = factory());
}(this, (function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var morton_1 = createCommonjsModule(function (module) {
	// Morton lookup tables.
	// Based on http://graphics.stanford.edu/~seander/bithacks.html#InterleaveTableLookup
	var X = [ 0, 1 ], Y = [ 0, 2 ];
	for (var i = 4; i < 0xFFFF; i <<= 2) {
	    for (var j = 0, l = X.length; j < l; j++) {
	        X.push((X[j] | i));
	        Y.push((X[j] | i) << 1);
	    }
	}

	// Only works for 24 bit input numbers (up to 16777215).
	var morton = module.exports = function morton(x, y) {
	    return (Y[y         & 0xFF] | X[x         & 0xFF]) +
	           (Y[(y >> 8)  & 0xFF] | X[(x >> 8)  & 0xFF]) * 0x10000 +
	           (Y[(y >> 16) & 0xFF] | X[(x >> 16) & 0xFF]) * 0x100000000;
	};

	var code = module.exports.code = function code(z, x, y) {
	    if (z > 24) { throw 'Morton codes are only supported up to Z=24'; }
	    var Z = 1 << (24 - z);
	    return morton(x * Z, y * Z);
	};

	var range = module.exports.range = function range(z, x, y) {
	    if (z > 24) { throw 'Morton ranges are only supported up to Z=24'; }
	    var Z = 1 << (24 - z);
	    var lower = morton(x * Z, y * Z);
	    return [ lower, lower + Z * Z - 1 ];
	};

	var rX, rY;
	var reverse = module.exports.reverse = function reverse(c) {
	    if (c > 0xFFFFFFFFFFFF) { throw 'Only morton codes up to 48 bits are supported.'; }
	    if (!rX) {
	        // Create reverse lookup tables.
	        rX = {}; rY = {};
	        for (var i = 0; i < 256; i++) {
	            rX[morton(i, 0)] = i;
	            rY[morton(0, i)] = i;
	        }
	    }

	    var x = rX[c & 0x5555];
	    var y = rY[c & 0xAAAA];
	    if (c > 0xFFFF) {
	        c /= 0x10000;
	        x |= rX[c & 0x5555] << 8;
	        y |= rY[c & 0xAAAA] << 8;
	        if (c > 0xFFFF) {
	            c /= 0x10000;
	            x |= rX[c & 0x5555] << 16;
	            y |= rY[c & 0xAAAA] << 16;
	        }
	    }

	    return [ x, y ];
	};

	var decode = module.exports.decode = function decode(z, c) {
	    var output = reverse(c);
	    var Z = 1 << (24 - z);
	    return [ output[0] / Z, output[1] / Z ];
	};
	});
	var morton_2 = morton_1.code;
	var morton_3 = morton_1.range;
	var morton_4 = morton_1.reverse;
	var morton_5 = morton_1.decode;

	// Fast Hilbert curve algorithm by http://threadlocalmutex.com/
	// Ported from C++ https://github.com/rawrunprotected/hilbert_curves (public domain)
	function hilbert(x, y) {
	  var a = x ^ y;
	  var b = 0xFFFF ^ a;
	  var c = 0xFFFF ^ (x | y);
	  var d = x & (y ^ 0xFFFF);

	  var A = a | (b >> 1);
	  var B = (a >> 1) ^ a;
	  var C = ((c >> 1) ^ (b & (d >> 1))) ^ c;
	  var D = ((a & (c >> 1)) ^ (d >> 1)) ^ d;

	  a = A; b = B; c = C; d = D;
	  A = ((a & (a >> 2)) ^ (b & (b >> 2)));
	  B = ((a & (b >> 2)) ^ (b & ((a ^ b) >> 2)));
	  C ^= ((a & (c >> 2)) ^ (b & (d >> 2)));
	  D ^= ((b & (c >> 2)) ^ ((a ^ b) & (d >> 2)));

	  a = A; b = B; c = C; d = D;
	  A = ((a & (a >> 4)) ^ (b & (b >> 4)));
	  B = ((a & (b >> 4)) ^ (b & ((a ^ b) >> 4)));
	  C ^= ((a & (c >> 4)) ^ (b & (d >> 4)));
	  D ^= ((b & (c >> 4)) ^ ((a ^ b) & (d >> 4)));

	  a = A; b = B; c = C; d = D;
	  C ^= ((a & (c >> 8)) ^ (b & (d >> 8)));
	  D ^= ((b & (c >> 8)) ^ ((a ^ b) & (d >> 8)));

	  a = C ^ (C >> 1);
	  b = D ^ (D >> 1);

	  var i0 = x ^ y;
	  var i1 = b | (0xFFFF ^ (i0 | a));

	  i0 = (i0 | (i0 << 8)) & 0x00FF00FF;
	  i0 = (i0 | (i0 << 4)) & 0x0F0F0F0F;
	  i0 = (i0 | (i0 << 2)) & 0x33333333;
	  i0 = (i0 | (i0 << 1)) & 0x55555555;

	  i1 = (i1 | (i1 << 8)) & 0x00FF00FF;
	  i1 = (i1 | (i1 << 4)) & 0x0F0F0F0F;
	  i1 = (i1 | (i1 << 2)) & 0x33333333;
	  i1 = (i1 | (i1 << 1)) & 0x55555555;

	  return ((i1 << 1) | i0) >>> 0;
	}

	function qsort (data, values, left, right) {
	  if (left >= right) { return; }

	  var pivot = values[(left + right) >> 1];
	  var i = left - 1;
	  var j = right + 1;
	  var temp;

	  while (true) {
	    do { i++; } while (values[i] < pivot);
	    do { j--; } while (values[j] > pivot);
	    if (i >= j) { break; }

	    // swap(data, values, i, j);
	    temp      = data[i];
	    data[i]   = data[j];
	    data[j]   = temp;

	    temp      = values[i];
	    values[i] = values[j];
	    values[j] = temp;
	  }

	  qsort(data, values, left, j);
	  qsort(data, values, j + 1, right);
	}

	function sort (coords, codes) {
	  return qsort(coords, codes, 0, coords.length - 1);
	}

	var InternalNode = function InternalNode (code, left, right) {
	  this.code = code;
	  this.left = left;
	  this.right= right;
	  left.parent = right.parent = this;

	  // this.x0 = Math.min(left.x0, right.x0);
	  // this.y0 = Math.min(left.y0, right.y0);
	  // this.x1 = Math.max(left.x1, right.x1);
	  // this.y1 = Math.max(left.y1, right.y1);
	};

	var Leaf = function Leaf (code, data) {
	  this.code = code;
	  this.data = data;

	  // this.x0 = this.x1 = data[0];
	  // this.y0 = this.y1 = data[1];
	};


	var BucketLeaf = function BucketLeaf (code, data) {
	  this.code = code;
	  this.data = data;
	    
	  // this.x0 = data.x1 = data[0];
	  // this.y0 = data.y1 = data[1];
	};

	function inOrder (fn, ctx) {
	  var current = this._root;
	  var Q = [];
	  var done = false;

	  while (!done) {
	    if (current) {
	      Q.push(current);
	      current = current.left;
	    } else {
	      if (Q.length !== 0) {
	        current = Q.pop();
	        if (fn.call(ctx, current)) { break; }
	        current = current.right;
	      } else { done = true; }
	    }
	  }
	  return this;
	}


	function preOrder (fn, ctx) {
	  var Q = [this._root];
	  while (Q.length !== 0)  {
	    var node = Q.pop();
	    if (!fn.call(ctx, node)) {
	      if (node.right) { Q.push(node.right); }
	      if (node.left)  { Q.push(node.left); }
	    }
	  }
	  return this;
	}


	function postOrder (fn, ctx) {
	  var Q = [];
	  var node = this._root, last;
	  do {
	    while (node) {
	      if (node.right) { Q.push(node.right); }
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


	function map (fn, ctx) {
	  var res = [];
	  this.inOrder(function (node) {
	    res.push(fn.call(ctx, node));
	  });
	  return res;
	}


	/**
	   * Tree height
	   * @return {Number}
	   */
	function height () {
	  return treeHeight(this._root);
	}


	  /**
	   * Print tree
	   * @public
	   * @export
	   * @param  {Function(Node):String} [printNode]
	   * @return {String}
	   */
	function toString (printNode) {
	  if ( printNode === void 0 ) printNode = function (n) { return n.code; };

	  var out = [];
	  row(this._root, '', true, function (v) { return out.push(v); }, printNode);
	  return out.join('');
	}


	  /**
	   * Number of nodes
	   * @return {Number}
	   */
	function size () {
	  var i = 0;
	  this.preOrder(function () { i++; });
	  return i;
	}


	function treeHeight (node) {
	  return node ? (1 + Math.max(treeHeight(node.left), treeHeight(node.right))) : 0;
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
	    out(prefix + (isTail ? '^-- ' : '|-- ') + printNode(root) + '\n');
	    var indent = prefix + (isTail ? '    ' : '|   ');
	    if (root.left)  { row(root.left,  indent, false, out, printNode); }
	    if (root.right) { row(root.right, indent, true,  out, printNode); }
	  }
	}

	var HILBERT = 1;
	var MORTON  = 0;

	/**
	 * @typedef {function(*):Number} CoordGetter
	 */


	function buildBuckets (data, ids, codes, first, last, bucketSize) {
	  if (last - first <= bucketSize) {
	    var bucket = new Array(last - first + 1);
	    for (var i = first, j = 0; i <= last; i++, j++) { bucket[j] = data[ids[i]]; }
	    return new BucketLeaf(codes[first], bucket);
	  }
	  var split = findSplit(codes, first, last);
	  var left  = buildBuckets(data, ids, codes, first, split, bucketSize);
	  var right = buildBuckets(data, ids, codes, split + 1, last, bucketSize);

	  // const nd = [left, right];
	  // nd.left = left; nd.right = right;
	  // return nd;
	  return new InternalNode(split, left, right);
	}


	function build (data, ids, codes, first, last) {
	  if (last - first === 0) { return new Leaf(codes[first], data[ids[first]]); }
	  var split = findSplit(codes, first, last);
	  var left  = build(data, ids, codes, first, split);
	  var right = build(data, ids, codes, split + 1, last);
	  // const nd = [left, right];
	  // nd.left = left; nd.right = right;
	  // return nd;
	  return new InternalNode(split, left, right);
	}


	function __clz(m) {
	  var c = 1 << 31;
	  for (var i = 0; i < 31; i += 1) {
	    if (c & m) { return i; }
	    c >>>= 1;
	  }
	  return 32;
	}


	// https://devblogs.nvidia.com/thinking-parallel-part-iii-tree-construction-gpu/
	function findSplit (codes, first, last) {
	  var f = codes[first];
	  var l = codes[last];

	  if (f === l) { return (first + last) >> 1; }

	  // Calculate the number of highest bits that are the same
	  // for all objects, using the count-leading-zeros intrinsic.
	  var commonPrefix = __clz(f ^ l);

	  // Use binary search to find where the next bit differs.
	  // Specifically, we are looking for the highest object that
	  // shares more than commonPrefix bits with the first one.

	  var split = first; // initial guess
	  var step = last - first, newSplit, splitCode, splitPrefix;

	  do {
	    step = (step + 1) >> 1; // exponential decrease
	    newSplit = split + step; // proposed new position

	    if (newSplit < last) {
	      splitCode = codes[newSplit];
	      splitPrefix = __clz(f ^ splitCode);
	      if (splitPrefix > commonPrefix) { split = newSplit; } // accept proposal
	    }
	  } while (step > 1)
	  return split;
	}


	var defaultX = function (p) { return p.x; };
	var defaultY = function (p) { return p.y; };

	/**
	 * @public
	 */
	var PHTree = function PHTree (points, getX, getY, bucketSize, sfc) {
	  if ( getX === void 0 ) getX = defaultX;
	  if ( getY === void 0 ) getY = defaultY;
	  if ( bucketSize === void 0 ) bucketSize = 0;
	  if ( sfc === void 0 ) sfc = HILBERT;

	  var n   = points.length;
	  var codes = new Uint32Array(n);
	  var minX = Infinity, minY = Infinity,
	      maxX = -Infinity, maxY = -Infinity;
	  var p, i, x, y;

	  /** @type {CoordGetter} */
	  this._x = getX;
	  /** @type {CoordGetter} */
	  this._y = getY;

	  var project = sfc === HILBERT ? hilbert : morton_1;
	  this._project = project;

	  var ids = new Uint32Array(n);

	  for (i = 0; i < n; i++) {
	    p = points[i];
	    x = getX(p);
	    y = getY(p);
	    if (x < minX) { minX = x; }
	    if (y < minY) { minY = y; }
	    if (x > maxX) { maxX = x; }
	    if (y > maxY) { maxY = y; }
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

	  var max = (1 << 16) - 1;
	  var w = max / (maxX - minX);
	  var h = max / (maxY - minY);
	  this._hw = w;
	  this._hh = h;

	  for (i = 0; i < n; i++) {
	    p = points[i];
	    codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
	  }
	  sort(ids, codes);

	  if (bucketSize === 0) {
	    /** @type {InternalNode?} */
	    this._root = build(points, ids, codes, 0, n - 1);
	  } else {
	    /** @type {InternalNode?} */
	    this._root = buildBuckets(points, ids, codes, 0, n - 1, bucketSize);
	  }
	  /** @type {Number} */
	  this._bucketSize = bucketSize;
	};


	PHTree.prototype.walk = function walk (fn) {
	  var stack = [this._minX, this._minY, this._maxX, this._maxY, 0];
	  var Q = [this._root];
	  while (Q.length !== 0) {
	    var node = Q.pop();

	    var dir= stack.pop();
	    var ymax = stack.pop();
	    var xmax = stack.pop();
	    var ymin = stack.pop();
	    var xmin = stack.pop();

	    if (node) {
	      if (fn(node, xmin, ymin, xmax, ymax)) { break; }
	      var hw = (xmax - xmin) / 2,
	            hh = (ymax - ymin) / 2;
	      //const nextDir = dir > 0 ? (dir - 1) : 3;
	      var nextDir = (dir + 1) % 2;

	      Q.push(node.left, node.right);

	      if (nextDir) { // by x
	        stack.push(xmin, ymin, xmin + hw, ymax, nextDir);
	        stack.push(xmin + hw, ymin, xmax, ymax, nextDir);
	      } else {     // by y
	        stack.push(xmin, ymin + hh, xmax, ymax, nextDir);
	        stack.push(xmin, ymin, xmax, ymin + hh, nextDir);
	      }
	    }
	  }
	  return this;
	};


	PHTree.prototype.query = function query (x0, y0, x1, y1) {
	  var res = [];
	  this.walk(function (n, xmin, ymin, xmax, ymax) {
	    if (n.data) { res.push(n.data); }
	    return !(xmax > x0 && xmin < x1) && (ymax > y0 && ymin < y1);
	  });
	  return res;
	};


	PHTree.prototype.inOrder   = inOrder;
	PHTree.prototype.preOrder  = preOrder;
	PHTree.prototype.postOrder = postOrder;
	PHTree.prototype.map       = map;
	PHTree.prototype.height    = height;
	PHTree.prototype.size      = size;
	PHTree.prototype.toString  = toString;

	PHTree.SFC = { HILBERT: HILBERT, MORTON: MORTON };

	return PHTree;

})));
//# sourceMappingURL=phtree.umd.js.map
