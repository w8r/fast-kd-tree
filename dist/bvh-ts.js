(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.bvh = {}));
}(this, function (exports) { 'use strict';

  const X = [0, 1];
  const Y = [0, 2];
  for (let i = 4; i < 0xffff; i <<= 2) {
      for (let j = 0, l = X.length; j < l; j++) {
          X.push(X[j] | i);
          Y.push((X[j] | i) << 1);
      }
  }
  // Only works for 24 bit input numbers (up to 16777215).
  function morton(x, y) {
      return ((Y[y & 0xff] | X[x & 0xff]) +
          (Y[(y >> 8) & 0xff] | X[(x >> 8) & 0xff]) * 0x10000 +
          (Y[(y >> 16) & 0xff] | X[(x >> 16) & 0xff]) * 0x100000000);
  }

  function hilbert(x, y) {
      let a = x ^ y;
      let b = 0xFFFF ^ a;
      let c = 0xFFFF ^ (x | y);
      let d = x & (y ^ 0xFFFF);
      let A = a | (b >> 1);
      let B = (a >> 1) ^ a;
      let C = ((c >> 1) ^ (b & (d >> 1))) ^ c;
      let D = ((a & (c >> 1)) ^ (d >> 1)) ^ d;
      a = A;
      b = B;
      c = C;
      d = D;
      A = ((a & (a >> 2)) ^ (b & (b >> 2)));
      B = ((a & (b >> 2)) ^ (b & ((a ^ b) >> 2)));
      C ^= ((a & (c >> 2)) ^ (b & (d >> 2)));
      D ^= ((b & (c >> 2)) ^ ((a ^ b) & (d >> 2)));
      a = A;
      b = B;
      c = C;
      d = D;
      A = ((a & (a >> 4)) ^ (b & (b >> 4)));
      B = ((a & (b >> 4)) ^ (b & ((a ^ b) >> 4)));
      C ^= ((a & (c >> 4)) ^ (b & (d >> 4)));
      D ^= ((b & (c >> 4)) ^ ((a ^ b) & (d >> 4)));
      a = A;
      b = B;
      c = C;
      d = D;
      C ^= ((a & (c >> 8)) ^ (b & (d >> 8)));
      D ^= ((b & (c >> 8)) ^ ((a ^ b) & (d >> 8)));
      a = C ^ (C >> 1);
      b = D ^ (D >> 1);
      let i0 = x ^ y;
      let i1 = b | (0xFFFF ^ (i0 | a));
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

  function qsort(data, values, left, right) {
      if (left >= right)
          return;
      const pivot = values[(left + right) >> 1];
      let i = left - 1;
      let j = right + 1;
      let temp;
      /* eslint-disable-next-line no-constant-condition */
      while (true) {
          do
              i++;
          while (values[i] < pivot);
          do
              j--;
          while (values[j] > pivot);
          if (i >= j)
              break;
          // swap(data, values, i, j);
          temp = data[i];
          data[i] = data[j];
          data[j] = temp;
          temp = values[i];
          values[i] = values[j];
          values[j] = temp;
      }
      qsort(data, values, left, j);
      qsort(data, values, j + 1, right);
  }
  function sort(things, codes) {
      return qsort(things, codes, 0, things.length - 1);
  }

  class InternalNode {
      constructor(code, left, right) {
          this.left = null;
          this.right = null;
          this.code = code;
          this.left = left;
          this.right = right;
          //left.parent = right.parent = this;
          // this.x0 = Math.min(left.x0, right.x0);
          // this.y0 = Math.min(left.y0, right.y0);
          // this.x1 = Math.max(left.x1, right.x1);
          // this.y1 = Math.max(left.y1, right.y1);
      }
  }

  class Leaf {
      constructor(code, data) {
          this.code = code;
          this.data = data;
      }
  }
  class BucketLeaf {
      constructor(code, data) {
          this.code = code;
          this.data = data;
      }
  }

  (function (SFC) {
      SFC[SFC["HILBERT"] = 1] = "HILBERT";
      SFC[SFC["MORTON"] = 0] = "MORTON";
  })(exports.SFC || (exports.SFC = {}));
  /**
   * @typedef {function(*):Number} CoordGetter
   */
  function buildBuckets(data, ids, codes, first, last, bucketSize) {
      if (last - first < bucketSize) {
          const bucket = new Array(last - first + 1);
          for (let i = first, j = 0; i <= last; i++, j++)
              bucket[j] = data[ids[i]];
          return new BucketLeaf(codes[first], bucket);
      }
      const split = findSplit(codes, first, last);
      const left = buildBuckets(data, ids, codes, first, split, bucketSize);
      const right = buildBuckets(data, ids, codes, split + 1, last, bucketSize);
      return new InternalNode(split, left, right);
  }
  function build(data, ids, codes, first, last) {
      if (last - first === 0)
          return new Leaf(codes[first], data[ids[first]]);
      const split = findSplit(codes, first, last);
      //const split = first + ((last - first) >> 1);
      const left = build(data, ids, codes, first, split);
      const right = build(data, ids, codes, split + 1, last);
      return new InternalNode(split, left, right);
  }
  class Node {
      constructor() {
          this.left = null;
          this.right = null;
          this.data = null;
      }
  }
  function buildIterative(data, ids, codes, start, end) {
      let root = new Node();
      const Q = [root];
      const stack = [start, end];
      while (Q.length !== 0) {
          const last = stack.pop();
          const first = stack.pop();
          const node = Q.pop();
          if (last - first === 0) {
              node.code = codes[first];
              node.data = data[ids[first]];
          }
          else {
              const split = findSplit(codes, first, last);
              //const split = (first + last) >> 1;
              node.code = split;
              if (first <= split) {
                  node.left = new Node();
                  Q.push(node.left);
                  stack.push(first, split);
              }
              if (last > split) {
                  node.right = new Node();
                  Q.push(node.right);
                  stack.push(split + 1, last);
              }
          }
      }
      return root;
  }
  function buildIterativeBuckets(data, ids, codes, start, end, bucketSize) {
      let root = new Node();
      const Q = [root];
      const stack = [start, end];
      while (Q.length !== 0) {
          const last = stack.pop();
          const first = stack.pop();
          const node = Q.pop();
          if (last - first < bucketSize) {
              const bucket = new Array(last - first + 1);
              for (let i = first, j = 0; i <= last; i++, j++)
                  bucket[j] = data[ids[i]];
              node.code = codes[first];
              node.data = bucket;
          }
          else {
              const split = findSplit(codes, first, last);
              node.code = split;
              if (first <= split) {
                  node.left = new Node();
                  Q.push(node.left);
                  stack.push(first, split);
              }
              if (last > split) {
                  node.right = new Node();
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
          if (c & m)
              return i;
          c >>>= 1;
      }
      return 32;
  }
  // https://devblogs.nvidia.com/thinking-parallel-part-iii-tree-construction-gpu/
  function findSplit(codes, first, last) {
      const f = codes[first];
      const l = codes[last];
      if (f === l)
          return first;
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
              if (splitPrefix > commonPrefix)
                  split = newSplit; // accept proposal
          }
      } while (step > 1);
      return split;
  }
  /**
   * @public
   */
  class BVH {
      /**
       * @constructor
       * @param  {Array<*>} points
       * @param  {object} [options]
       * @param  {CoordGetter} [options.getX]
       * @param  {CoordGetter} [options.getY]
       * @param  {Number}   [options.bucketSize]
       * @param  {Number}   [options.sfc]
       * @param  {boolean}  [options.recursive]
       */
      constructor(points, { getX, getY, bucketSize = 0, sfc = exports.SFC.HILBERT, recursive = true } = {}) {
          this._bucketSize = 0;
          this._root = null;
          const n = points.length;
          const codes = new Uint32Array(n);
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          let p, i, x, y;
          /** @type {CoordGetter} */
          this._x = getX;
          /** @type {CoordGetter} */
          this._y = getY;
          const project = sfc === exports.SFC.HILBERT ? hilbert : morton;
          this._project = project;
          const ids = new Uint32Array(n);
          for (i = 0; i < n; i++) {
              p = points[i];
              x = getX(p);
              y = getY(p);
              if (x < minX)
                  minX = x;
              if (y < minY)
                  minY = y;
              if (x > maxX)
                  maxX = x;
              if (y > maxY)
                  maxY = y;
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
          }
          else {
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
      // traversals
      inOrder(fn, ctx) {
          let current = this._root;
          const Q = [];
          let done = false;
          while (!done) {
              if (current) {
                  Q.push(current);
                  current = current.left;
              }
              else {
                  if (Q.length !== 0) {
                      current = Q.pop();
                      if (fn.call(ctx, current))
                          break;
                      current = current.right;
                  }
                  else
                      done = true;
              }
          }
          return this;
      }
      preOrder(fn, ctx) {
          const Q = [this._root];
          while (Q.length !== 0) {
              const node = Q.pop();
              if (!fn.call(ctx, node)) {
                  if (node.right)
                      Q.push(node.right);
                  if (node.left)
                      Q.push(node.left);
              }
          }
          return this;
      }
      postOrder(fn, ctx) {
          const Q = [];
          let node = this._root, last;
          do {
              while (node) {
                  if (node.right)
                      Q.push(node.right);
                  Q.push(node);
                  node = node.left;
              }
              node = Q.pop();
              last = Q.length - 1;
              if (node.right && Q[last] === node.right) {
                  Q[last] = node;
                  node = node.right;
              }
              else {
                  fn.call(ctx, node);
                  node = null;
              }
          } while (Q.length !== 0);
          return this;
      }
      map(fn, ctx) {
          const res = [];
          this.inOrder(node => {
              res.push(fn.call(ctx, node));
          });
          return res;
      }
      /**
       * Tree height
       * @return {Number}
       */
      height() {
          return treeHeight(this._root);
      }
      /**
       * Print tree
       * @public
       * @export
       * @param  {Function(Node):String} [printNode]
       * @return {String}
       */
      toString(printNode = (n) => n.code.toString()) {
          const out = [];
          row(this._root, '', true, (v) => out.push(v), printNode);
          return out.join('');
      }
      /**
       * Number of nodes
       * @return {Number}
       */
      size() {
          let i = 0;
          this.preOrder(() => { i++; });
          return i;
      }
  }
  function treeHeight(node) {
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
  function row(root, prefix, isTail, out, printNode) {
      if (root) {
          out(prefix + (isTail ? '^-- ' : '|-- ') + printNode(root) + '\n');
          const indent = prefix + (isTail ? '    ' : '|   ');
          if (root.left)
              row(root.left, indent, false, out, printNode);
          if (root.right)
              row(root.right, indent, true, out, printNode);
      }
  }

  exports.default = BVH;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=bvh.js.map
