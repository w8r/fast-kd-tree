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

	function swap(array, codes, i, j) {
	  var temp = array[i];
	  array[i]   = array[j];
	  array[j]   = temp;

	  var code = codes[i];
	  codes[i]   = codes[j];
	  codes[j]   = code;
	}


	function qsort(data, values, left, right) {
	  if (left >= right) { return; }

	  var pivot = values[(left + right) >> 1];
	  var i = left - 1;
	  var j = right + 1;

	  while (true) {
	      do { i++; } while (values[i] < pivot);
	      do { j--; } while (values[j] > pivot);
	      if (i >= j) { break; }
	      swap(data, values, i, j);
	  }

	  qsort(data, values, left, j);
	  qsort(data, values, j + 1, right);
	}

	function sort (coords, codes) {
	  return qsort(coords, codes, 0, coords.length - 1);
	}

	var KDTree = function KDTree (points, x, y) {
	  if ( x === void 0 ) x = function (p) { return p.x; };
	  if ( y === void 0 ) y = function (p) { return p.y; };

	  this._x = x;
	  this._y = y;
	  this.buildHilbert(points);
	  //this.build(points);
	};

	KDTree.prototype.buildHilbert = function buildHilbert (points) {
	  var n     = points.length;
	  var hvalues = new Array(n);
	  var order = new Array(n);
	  var x = this._x, y = this._y;

	  for (var i = 0; i < n; i++) {
	    var p = points[i];
	    hvalues[i] = morton_1(x(p), y(p));
	    order[i]= i;
	  }
	  sort(order, hvalues);
	  this._list = toList(points, order, hvalues, x, y);
	  this._root = sortedListToBST({ head: this._list }, 0, n);

	  var node = this._list;
	  // while (node) {
	  // node.xmin = node.ymin = Infinity;
	  // node.xmax = node.ymax = -Infinity;
	  // node = node.next;
	  // }

	  node = this._list;
	  // while (node) {
	  // const parent = node.parent;
	  // const xn = x(node.point), yn = y(node.point);
	  // if (parent) {
	  //   if (xn < parent.xmin) parent.xmin = xn;
	  //   if (yn < parent.ymin) parent.ymin = yn;
	  //   if (xn > parent.xmax) parent.xmax = xn;
	  //   if (yn > parent.ymax) parent.ymax = yn;
	  // }
	  // node = node.next;
	  // }
	};

	// build (points) {
	// const n = points.length;
	// const x = this._x, y = this._y;
	// const indexes = new Array(n);
	// const X = new Array(n), Y = new Array(n);
	// for (let i = 0; i < n; i++) {
	//   const p = points[i];
	//   X[i] = x(p); Y[i] = y(p); indexes[i] = i;
	// }
	// const byX = sort(indexes.slice(), X);
	// const byY = sort(indexes.slice(), Y);


	// }

	// _build (points, order, start, end) {
	// if (start === end) { // leaf
	//   return { point: points[start], parent: null, left: null, right: null };
	// } else {
	//   const med = Math.floor((start + end) / 2);
	//   const root = { points[med]
	// }

	// }


	KDTree.prototype.query = function query (xmin, ymin, xmax, ymax) {
	    var this$1 = this;

	  var qmin = morton_1(xmin, ymin), qmax = morton_1(xmax, ymax);
	  var result = [];

	  this.range(qmin, qmax, function (node) {
	    var x = this$1._x(node.point), y = this$1._y(node.point);
	    if (x <= xmax && x >= xmin && y <= ymax && y >= ymin) {
	      result.push(node.point);
	    }
	  });

	  return result;


	  // const Q = [this._root];
	  // const result = [];
	  // while (Q.length !== 0) {
	  // const node = Q.pop();
	  // if (node) {
	  //   const x = this._x(node.point), y = this._y(node.point);
	  //   if (x <= xmax && x >= xmin && y <= ymax && y >= ymin) {
	  //     result.push(node.point);
	  //   }
	  //   const { left, right } = node;
	  //   if (left&& left.code>= qmin) Q.push(left);
	  //   if (right && right.code <= qmax) Q.push(right);
	  //   console.log(node.code, node.left, node.right, qmin, qmax);
	  // }
	  // }
	  // return result;
	};


	KDTree.prototype.range = function range (low, high, fn, ctx) {
	    var this$1 = this;

	  var Q = [];
	  var node = this._root;

	  while (Q.length !== 0 || node) {
	    if (node) {
	      Q.push(node);
	      node = node.left;
	    } else {
	      node = Q.pop();
	      if (node.code > high) {
	        break;
	      } else if (node.code >= low) {
	        if (fn.call(ctx, node)) { return this$1; } // stop if smth is returned
	      }
	      node = node.right;
	    }
	  }
	  return this;
	};


	function toList (nodes, order, codes, x, y) {
	  var list = { next: null };
	  var prev = list;
	  for (var i = 0; i < nodes.length; i++) {
	    var node = nodes[order[i]];
	    //const cx = x(node), cy = y(node);

	    prev = prev.next = node;
	  }
	  prev.next = null;
	  return list.next;
	}


	function sortedListToBST (list, start, end) {
	  var size = end - start;
	  if (size > 0) {
	    var middle = start + (size >> 1);
	    var left = sortedListToBST(list, start, middle);

	    var root = list.head;
	    root.left = left;
	    if (root.left) { root.left.parent = root; }

	    list.head = list.head.next;

	    root.right = sortedListToBST(list, middle + 1, end);
	    if (root.right) { root.right.parent = root; }
	    return root;
	  }

	  return null;
	}


	function sortedListToBST (list, first, last) {
	  var size = last - first;
	  if (size === 0) { return list.head; }
	  var split = first + (size >> 1);
	  var left  = sortedListToBST(list, first, split);
	  list.head = list.head.next;
	  var right = sortedListToBST(list, split + 1, last);
	  // const node = [left, right];
	  // node.code = split;
	  // return node;
	  return { left: left, right: right };
	}

	var InternalNode = function InternalNode(code, left, right) {
	//constructor(left, right) {
	  this.code= code;
	  this.left= left;
	  this.right = right;
	  left.parent = right.parent = this;
	};

	var Leaf = function Leaf (code, data) {
	  this.code = code;
	  this.data = data;
	};

	var BucketLeaf = function BucketLeaf (code, data) {
	  this.code = code;
	  this.data = data;
	};


	function buildBuckets (data, ids, codes, first, last, bucketSize) {
	  if (last - first <= bucketSize) {
	    return new BucketLeaf(codes[first], ids.slice(first, last).map(function (i) { return data[i]; }));
	  }
	  var split = findSplit(codes, first, last);
	  var left  = build(data, ids, codes, first, split, bucketSize);
	  var right = build(data, ids, codes, split + 1, last, bucketSize);
	  var node = [left, right];
	  node.code = split;
	  return node;
	  //return new InternalNode(split, left, right);
	}


	function build (data, ids, codes, first, last) {
	  if (last - first === 0) { return new Leaf(codes[first], data[ids[first]]); }
	  var split = findSplit(codes, first, last);
	  var left  = build(data, ids, codes, first, split);
	  var right = build(data, ids, codes, split + 1, last);
	  // const node = [left, right];
	  // node.code = split;
	  // return node;
	  return new InternalNode(split, left, right);
	}


	function __clz(m) {
	  var c = 1 << 31;
	  for (var i = 0; i < 32; i += 1) {
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


	var PHTree = function PHTree(points, getX, getY, bucketSize, sfc) {
	  if ( getX === void 0 ) getX = defaultX;
	  if ( getY === void 0 ) getY = defaultY;
	  if ( bucketSize === void 0 ) bucketSize = 0;
	  if ( sfc === void 0 ) sfc = 'hilbert';

	  var n   = points.length;
	  var codes = new Uint32Array(n);
	  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	  var p, i, x, y;

	  this._x = getX;
	  this._y = getY;

	  var project = sfc === 'hilbert' ? hilbert : morton_1;
	  this._project = project;

	  var ids = new Uint32Array(n);

	  //const xz = new Float32Array(n), yz = new Float32Array(n);
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

	  this._minX = minX;
	  this._minY = minY;
	  this._maxX = maxX;
	  this._maxY = maxY;

	  var max = (1 << 16) - 1;
	  var w = max / (maxX - minX);
	  var h = max / (maxY - minY);
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
	};


	PHTree.prototype.visit = function visit (fn, ctx) {
	  var Q = [this._root];
	  while (Q.length !== 0) {
	    var node = Q.pop();
	    if (node) {
	      if (fn.call(ctx, node)) { break; }
	      if (!node.data) {
	        Q.push(node.left);
	        Q.push(node.right);
	      }
	    }
	  }
	  return this;
	};


	PHTree.prototype.visitAfter = function visitAfter (fn, ctx) {
	  var current = this._root;
	  var Q = [];/* Initialize stack s */
	  var done = false;

	  while (!done) {
	    if (current) {
	      Q.push(current);
	      current = current.left;
	    } else {
	      if (Q.length !== 0) {
	        current = Q.pop();
	        fn.call(ctx, current);
	        current = current.right;
	      } else { done = true; }
	    }
	  }
	  return this;
	};


	PHTree.prototype.query = function query (x0, y0, x1, y1) {
	  var result = [];
	  this.visit(function (node) {

	  });
	  return result;
	};

	PHTree.prototype.map = function map (fn, ctx) {
	  var res = [];
	  this.visitAfter(function (node) {
	    res.push(fn.call(ctx, node));
	  });
	  return res;
	};


	PHTree.prototype.height = function height$1 () {
	  return height(this._root);
	};


	PHTree.prototype.toString = function toString (printNode) {
	    if ( printNode === void 0 ) printNode = function (n) { return n.code; };

	  var out = [];
	  row(this._root, '', true, function (v) { return out.push(v); }, printNode);
	  return out.join('');
	};


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
	    out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
	    var indent = prefix + (isTail ? '    ' : '│   ');
	    if (root.left)  { row(root.left,  indent, false, out, printNode); }
	    if (root.right) { row(root.right, indent, true,  out, printNode); }
	  }
	}

	PHTree.KD = KDTree;

	return PHTree;

})));
//# sourceMappingURL=phtree.umd.js.map
