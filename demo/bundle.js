(function (d3) {
	'use strict';

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

	function circleContainsCircle(cx, cy, cr, x, y, r) {
	  var dx = cx - x;
	  var dy = cy - y;
	  var dr = cr - r;
	  // reduce precision not to deal with square roots
	  return (dx * dx + dy * dy) < (dr * dr + 1e-6);
	}

	function from2discs(ax, ay, bx, by, ar, br) {
	  var dx = bx - ax;
	  var dy = by - ay;
	  var dr = br - ar;
	  var l = Math.sqrt(dx * dx + dy * dy);

	  return [
	    (ax + bx + dx / l * dr) / 2,
	    (ay + by + dy / l * dr) / 2,
	    (l + ar + br) / 2
	  ];
	}


	function from3discs(ax, ay, bx, by, cx, cy, ar, br, cr) {
	  var a2 = 2 * (ax - bx),
	    b2 = 2 * (ay - by),
	    c2 = 2 * (br - ar);
	  var d2 = ax * ax + ay * ay - ar * ar - bx * bx - by * by + br * br;
	  var a3 = 2 * (ax - cx),
	    b3 = 2 * (ay - cy),
	    c3 = 2 * (cr - ar);
	  var d3$$1 = ax * ax + ay * ay - ar * ar - cx * cx - cy * cy + cr * cr;
	  var ab = a3 * b2 - a2 * b3,
	    xa = (b2 * d3$$1 - b3 * d2) / ab - ax,
	    xb = (b3 * c2 - b2 * c3) / ab,
	    ya = (a3 * d2 - a2 * d3$$1) / ab - ay,
	    yb = (a2 * c3 - a3 * c2) / ab;

	  var A = xb * xb + yb * yb - 1,
	    B = 2 * (xa * xb + ya * yb + ar),
	    C = xa * xa + ya * ya - ar * ar,
	    r = (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
	  return [
	    xa + xb * r + ax,
	    ya + yb * r + ay,
	    r
	  ];
	}


	function combine(P, S, X, Y, R, from2, from3) {
	  var circle = null;
	  var len = S.length;
	  var u, v, w;

	  if (len === 1) { // 1 point
	    u = S[0];
	    circle = [X(u), Y(u), R(u) || 0];
	  } else if (len === 2) { // 2 points
	    u = S[0];
	    v = S[1];
	    circle = from2discs(X(u), Y(u), X(v), Y(v), R(u), R(v));
	  } else if (len === 3) { // 3 points
	    u = S[0];
	    v = S[1];
	    w = S[2];
	    circle = from3discs(X(u), Y(u), X(v), Y(v), X(w), Y(w), R(u), R(v), R(w));
	  }

	  return circle;
	}


	function minDisc (points, bounds, n, X, Y, R) {
	  var circle = null;

	  if (n === 0 || bounds.length === 3) {
	    circle = combine(points, bounds, X, Y, R);
	  } else {
	    var u = points[n - 1];
	    circle = minDisc(points, bounds, n - 1, X, Y, R);
	    if (circle === null || !circleContainsCircle(circle[0], circle[1], circle[2], X(u), Y(u), R(u))) {
	      bounds.push(u);
	      circle = minDisc(points, bounds, n - 1, X, Y, R);
	      bounds.pop();
	    }
	  }

	  return circle;
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


	var PHTree = function PHTree (points, getX, getY, bucketSize, sfc) {
	  if ( getX === void 0 ) getX = defaultX;
	  if ( getY === void 0 ) getY = defaultY;
	  if ( bucketSize === void 0 ) bucketSize = 0;
	  if ( sfc === void 0 ) sfc = 'hilbert';

	  var n   = points.length;
	  var codes = new Uint32Array(n);
	  var minX = Infinity, minY = Infinity,
	      maxX = -Infinity, maxY = -Infinity;
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
	    this._root = buildBuckets(points, ids, codes, 0, n - 1, bucketSize);
	  }
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


	PHTree.prototype.height = function height$1 () {
	  return height(this._root);
	};


	PHTree.prototype.toString = function toString (printNode) {
	    if ( printNode === void 0 ) printNode = function (n) { return n.code; };

	  var out = [];
	  row(this._root, '', true, function (v) { return out.push(v); }, printNode);
	  return out.join('');
	};


	PHTree.prototype.size = function size () {
	  var i = 0;
	  this.visit(function () { i++; });
	  return i;
	};


	PHTree.prototype.inOrder   = inOrder;
	PHTree.prototype.preOrder  = preOrder;
	PHTree.prototype.postOrder = postOrder;
	PHTree.prototype.map       = map;

	PHTree.minDisc = minDisc;


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
	    out(prefix + (isTail ? '^-- ' : '|-- ') + printNode(root) + '\n');
	    var indent = prefix + (isTail ? '    ' : '|   ');
	    if (root.left)  { row(root.left,  indent, false, out, printNode); }
	    if (root.right) { row(root.right, indent, true,  out, printNode); }
	  }
	}

	var screenWidth  = document.documentElement.clientWidth;
	var screenHeight = document.documentElement.clientHeight;

	var pxRatio = window.devicePixelRatio;

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	canvas.style.width  = screenWidth + 'px';
	canvas.style.height = screenHeight + 'px';

	  // global width/height to use for rendering, accunting for retina screens
	var w = canvas.width = screenWidth * devicePixelRatio;
	var h = canvas.height = screenHeight * devicePixelRatio;

	var N = 500;

	// const points = new Array(N).fill(0).map(() => {
	//   return {
	//     x: Math.random() * w,
	//     y: Math.random() * h
	//   };
	// });
	var cells = Math.sqrt(N) | 0;
	var x = w / cells / 2, y = -h / cells / 2;
	var points = new Array(N).fill(0).map(function (_, i) {
	  if (i % cells === 0) {
	    y += h / cells;
	    x = w / cells / 2;
	  }
	  var pt = { x: x, y: y };
	  x += w / cells;
	  return pt;
	});


	var tree = window.tree = new PHTree(points);
	var leftColor = d3.scaleLinear().domain([0, Math.floor(N / 2)])
	      .interpolate(d3.interpolateRgb)
	      .range(['orange', 'red']);

	var rightColor = d3.scaleLinear().domain([Math.floor(N / 2), N])
	      .interpolate(d3.interpolateRgb)
	      .range(['gray', 'blue']);


	function getPoints(subtree) {
	  var list = [];
	  var q = [subtree];
	  while (q.length !== 0) {
	    var next = q.pop();
	    if (next) {
	      list.push(next.point);
	      if (next.left)  { list.push(next.left.point); }
	      if (next.right) { list.push(next.right.point); }
	      q.push(next.left, next.right);
	    }
	  }
	  return list;
	}


	function getBBox(node) {
	  if (node) {
	    var points = [node.point].concat(getPoints(node.left)).concat(getPoints(node.right));
	    return points.reduce(function (acc, ref) {
	      var x = ref.x;
	      var y = ref.y;

	      acc[0] = Math.min(x, acc[0]);
	      acc[1] = Math.min(y, acc[1]);
	      acc[2] = Math.max(x, acc[2]);
	      acc[3] = Math.max(y, acc[3]);
	      return acc;
	    }, [Infinity, Infinity, -Infinity, -Infinity ]);
	  } else { return null; }
	}

	var query = [0,0,0,0];
	var found = [];

	canvas.addEventListener('mousemove', function (ref) {
	  var x = ref.x;
	  var y = ref.y;

	  x *= pxRatio;
	  y *= pxRatio;
	  found.length = 0;
	  query[0] = x - 50;
	  query[1] = y - 50;
	  query[2] = x + 50;
	  query[3] = y + 50;

	  found.push.apply(found, tree.query(query[0], query[1], query[2], query[3]));
	  requestAnimationFrame(render);
	});

	var r = 5;
	function render() {
	  ctx.clearRect(0, 0, w, h);

	  ctx.globalAlpha = 0.2;
	  var mid = tree._root.code;
	  // while (Q.length !== 0) {
	  //   const node = Q.pop();
	  //   if (node) {
	  //     const pts = getPoints(node);
	  //     const hull = polygonHull(pts.map(({x,y}) => [x, y]));
	  //     if (hull) {
	  //       ctx.beginPath();
	  //       ctx.fillStyle = node.code < mid ? 'blue' : 'orange';
	  //       // (!node.parent || node.parent.left === node) ? 'blue' : 'orange';
	  //       ctx.moveTo(hull[0][0], hull[0][1]);
	  //       for (let i = 1; i < hull.length; i++) {
	  //         const hp = hull[i];
	  //         ctx.lineTo(hp[0], hp[1]);
	  //       }
	  //       ctx.lineTo(hull[0][0], hull[0][1]);
	  //       ctx.closePath();
	  //       ctx.fill();
	  //     }
	  //     Q.unshift(node.left, node.right);
	  //   }
	  // }
	  ctx.globalAlpha = 1;

	  ctx.fillStyle = 'orange';
	  ctx.beginPath();
	  points.forEach(function (ref) {
	    var x = ref.x;
	    var y = ref.y;

	    ctx.moveTo(x + r, y);
	    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	  });
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();

	  ctx.fillStyle = 'red';
	  ctx.beginPath();
	  [tree._root.point].forEach(function (ref) {
	    var x = ref.x;
	    var y = ref.y;

	    ctx.moveTo(x + r, y);
	    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	  });
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();

	  var ll = getPoints(tree._root.left);
	  var rr = getPoints(tree._root.left);

	  ctx.fillStyle = 'orange';
	  ctx.beginPath();
	  ll.forEach(function (ref) {
	    var x = ref.x;
	    var y = ref.y;

	    ctx.moveTo(x + r, y);
	    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	  });
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();

	  ctx.fillStyle = 'blue';
	  ctx.beginPath();
	  rr.forEach(function (ref) {
	    var x = ref.x;
	    var y = ref.y;

	    ctx.moveTo(x + r, y);
	    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	  });
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();


	  ctx.beginPath();
	  var node = tree._list;
	  while (node) {
	    var bbox = node.bbox = getBBox(node);
	    if (bbox) {
	      ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
	    }
	    node = node.next;
	  }
	  ctx.closePath();
	  ctx.stroke();


	  ctx.beginPath();
	  node = tree._list;
	  while (node) {
	    var bbox$1 = node.bbox;
	    node = node.next;
	  }
	  ctx.closePath();
	  ctx.stroke();

	  ctx.beginPath();
	  ctx.strokeStyle = 'red';
	  ctx.lineWidth = 2;
	  ctx.rect(query[0], query[1], query[2] - query[0], query[3] - query[1]);
	  ctx.stroke();
	  ctx.strokeStyle = 'black';
	  ctx.lineWidth = 1;


	  ctx.fillStyle = 'red';
	  ctx.beginPath();
	  found.forEach(function (ref) {
	    var x = ref.x;
	    var y = ref.y;

	    ctx.moveTo(x + r, y);
	    ctx.arc(x, y, 2 * r, 0, 2 * Math.PI, false);
	  });
	  ctx.closePath();
	  ctx.fill();
	  ctx.stroke();
	}

	render();

}(d3));
