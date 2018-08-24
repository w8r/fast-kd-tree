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
  (global.sfctree = factory());
}(this, (function () { 'use strict';

  function qsort(data, values, left, right) {
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

  var defaultX = function (d) { return d.x; };
  var defaultY = function (d) { return d.y; };


  function build (data, ids, codes, first, last) {
    if (last - first === 0) { return new Leaf(codes[first], data[ids[first]]); }
    var split = (last + first) >> 1;
    var left  = build(data, ids, codes, first, split);
    var right = build(data, ids, codes, split + 1, last);
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
  var SFCTree = function SFCTree (points, getX, getY, bucketSize) {
    if ( getX === void 0 ) getX = defaultX;
    if ( getY === void 0 ) getY = defaultY;
    if ( bucketSize === void 0 ) bucketSize = 0;

    this._x = getX;
    this._y = getY;
    this._bucketSize = bucketSize;
    this.buildHilbert(points);
    //this.build(points);
  };


  SFCTree.prototype.buildHilbert = function buildHilbert (points) {
      var this$1 = this;

    var n     = points.length;
    var hvalues = new Array(n);
    var order = new Array(n);

    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (var i = 0; i < n; i++) {
      var p = points[i];
      var x = this$1._x(p), y = this$1._y(p);
      hvalues[i] = hilbert(x, y);
      if (x < minX) { minX = x; }
      if (y < minY) { minY = y; }
      if (x > maxX) { maxX = x; }
      if (y > maxY) { maxY = y; }
      order[i]= i;
    }
    sort(order, hvalues);

    // this._list = toList(points, order, hvalues, this._x, this._y);
    // this._root = sortedListToBST({ head: this._list }, 0, n);
    this._minX = minX;
    this._minY = minY;
    this._maxX = maxX;
    this._maxY = maxY;

    this._root = build(points, order, hvalues, 0, n - 1);

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


  SFCTree.prototype.query = function query (xmin, ymin, xmax, ymax) {
    var qmin = hilbert(xmin, ymin), qmax = hilbert(xmax, ymax);
    var result = [];

    // this.range(qmin, qmax, (node) => {
    // const x = this._x(node.point), y = this._y(node.point);
    // if (x <= xmax && x >= xmin && y <= ymax && y >= ymin) {
    //   result.push(node.point);
    // }
    // });

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


  SFCTree.prototype.range = function range (low, high, fn, ctx) {
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

  SFCTree.prototype.inOrder   = inOrder;
  SFCTree.prototype.preOrder  = preOrder;
  SFCTree.prototype.postOrder = postOrder;
  SFCTree.prototype.map       = map;

  return SFCTree;

})));
//# sourceMappingURL=sfctree.umd.js.map
