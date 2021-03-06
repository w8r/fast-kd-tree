(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var alea = createCommonjsModule(function (module) {
	// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
	// http://baagoe.com/en/RandomMusings/javascript/
	// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
	// Original work is under MIT license -

	// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	// 
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	// 
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.



	(function(global, module, define) {

	function Alea(seed) {
	  var me = this, mash = Mash();

	  me.next = function() {
	    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
	    me.s0 = me.s1;
	    me.s1 = me.s2;
	    return me.s2 = t - (me.c = t | 0);
	  };

	  // Apply the seeding algorithm from Baagoe.
	  me.c = 1;
	  me.s0 = mash(' ');
	  me.s1 = mash(' ');
	  me.s2 = mash(' ');
	  me.s0 -= mash(seed);
	  if (me.s0 < 0) { me.s0 += 1; }
	  me.s1 -= mash(seed);
	  if (me.s1 < 0) { me.s1 += 1; }
	  me.s2 -= mash(seed);
	  if (me.s2 < 0) { me.s2 += 1; }
	  mash = null;
	}

	function copy(f, t) {
	  t.c = f.c;
	  t.s0 = f.s0;
	  t.s1 = f.s1;
	  t.s2 = f.s2;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new Alea(seed),
	      state = opts && opts.state,
	      prng = xg.next;
	  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
	  prng.double = function() {
	    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
	  };
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	function Mash() {
	  var n = 0xefc8249d;

	  var mash = function(data) {
	    data = data.toString();
	    for (var i = 0; i < data.length; i++) {
	      n += data.charCodeAt(i);
	      var h = 0.02519603282416938 * n;
	      n = h >>> 0;
	      h -= n;
	      h *= n;
	      n = h >>> 0;
	      h -= n;
	      n += h * 0x100000000; // 2^32
	    }
	    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
	  };

	  return mash;
	}


	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.alea = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xor128 = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xor128" prng algorithm by
	// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  me.x = 0;
	  me.y = 0;
	  me.z = 0;
	  me.w = 0;

	  // Set up generator function.
	  me.next = function() {
	    var t = me.x ^ (me.x << 11);
	    me.x = me.y;
	    me.y = me.z;
	    me.z = me.w;
	    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
	  };

	  if (seed === (seed | 0)) {
	    // Integer seed.
	    me.x = seed;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 64; k++) {
	    me.x ^= strseed.charCodeAt(k) | 0;
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.x = f.x;
	  t.y = f.y;
	  t.z = f.z;
	  t.w = f.w;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xor128 = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xorwow = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xorwow" prng algorithm by
	// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  // Set up generator function.
	  me.next = function() {
	    var t = (me.x ^ (me.x >>> 2));
	    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
	    return (me.d = (me.d + 362437 | 0)) +
	       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
	  };

	  me.x = 0;
	  me.y = 0;
	  me.z = 0;
	  me.w = 0;
	  me.v = 0;

	  if (seed === (seed | 0)) {
	    // Integer seed.
	    me.x = seed;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 64; k++) {
	    me.x ^= strseed.charCodeAt(k) | 0;
	    if (k == strseed.length) {
	      me.d = me.x << 10 ^ me.x >>> 4;
	    }
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.x = f.x;
	  t.y = f.y;
	  t.z = f.z;
	  t.w = f.w;
	  t.v = f.v;
	  t.d = f.d;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xorwow = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xorshift7 = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xorshift7" algorithm by
	// François Panneton and Pierre L'ecuyer:
	// "On the Xorgshift Random Number Generators"
	// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this;

	  // Set up generator function.
	  me.next = function() {
	    // Update xor generator.
	    var X = me.x, i = me.i, t, v;
	    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
	    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
	    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
	    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
	    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
	    X[i] = v;
	    me.i = (i + 1) & 7;
	    return v;
	  };

	  function init(me, seed) {
	    var j, w, X = [];

	    if (seed === (seed | 0)) {
	      // Seed state array using a 32-bit integer.
	      w = X[0] = seed;
	    } else {
	      // Seed state using a string.
	      seed = '' + seed;
	      for (j = 0; j < seed.length; ++j) {
	        X[j & 7] = (X[j & 7] << 15) ^
	            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
	      }
	    }
	    // Enforce an array length of 8, not all zeroes.
	    while (X.length < 8) { X.push(0); }
	    for (j = 0; j < 8 && X[j] === 0; ++j){ }
	    if (j == 8) { w = X[7] = -1; } else { w = X[j]; }

	    me.x = X;
	    me.i = 0;

	    // Discard an initial 256 values.
	    for (j = 256; j > 0; --j) {
	      me.next();
	    }
	  }

	  init(me, seed);
	}

	function copy(f, t) {
	  t.x = f.x.slice();
	  t.i = f.i;
	  return t;
	}

	function impl(seed, opts) {
	  if (seed == null) { seed = +(new Date); }
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (state.x) { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xorshift7 = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xor4096 = createCommonjsModule(function (module) {
	// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
	//
	// This fast non-cryptographic random number generator is designed for
	// use in Monte-Carlo algorithms. It combines a long-period xorshift
	// generator with a Weyl generator, and it passes all common batteries
	// of stasticial tests for randomness while consuming only a few nanoseconds
	// for each prng generated.  For background on the generator, see Brent's
	// paper: "Some long-period random number generators using shifts and xors."
	// http://arxiv.org/pdf/1004.3115v1.pdf
	//
	// Usage:
	//
	// var xor4096 = require('xor4096');
	// random = xor4096(1);                        // Seed with int32 or string.
	// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
	// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
	//
	// For nonzero numeric keys, this impelementation provides a sequence
	// identical to that by Brent's xorgens 3 implementaion in C.  This
	// implementation also provides for initalizing the generator with
	// string seeds, or for saving and restoring the state of the generator.
	//
	// On Chrome, this prng benchmarks about 2.1 times slower than
	// Javascript's built-in Math.random().

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this;

	  // Set up generator function.
	  me.next = function() {
	    var w = me.w,
	        X = me.X, i = me.i, t, v;
	    // Update Weyl generator.
	    me.w = w = (w + 0x61c88647) | 0;
	    // Update xor generator.
	    v = X[(i + 34) & 127];
	    t = X[i = ((i + 1) & 127)];
	    v ^= v << 13;
	    t ^= t << 17;
	    v ^= v >>> 15;
	    t ^= t >>> 12;
	    // Update Xor generator array state.
	    v = X[i] = v ^ t;
	    me.i = i;
	    // Result is the combination.
	    return (v + (w ^ (w >>> 16))) | 0;
	  };

	  function init(me, seed) {
	    var t, v, i, j, w, X = [], limit = 128;
	    if (seed === (seed | 0)) {
	      // Numeric seeds initialize v, which is used to generates X.
	      v = seed;
	      seed = null;
	    } else {
	      // String seeds are mixed into v and X one character at a time.
	      seed = seed + '\0';
	      v = 0;
	      limit = Math.max(limit, seed.length);
	    }
	    // Initialize circular array and weyl value.
	    for (i = 0, j = -32; j < limit; ++j) {
	      // Put the unicode characters into the array, and shuffle them.
	      if (seed) { v ^= seed.charCodeAt((j + 32) % seed.length); }
	      // After 32 shuffles, take v as the starting w value.
	      if (j === 0) { w = v; }
	      v ^= v << 10;
	      v ^= v >>> 15;
	      v ^= v << 4;
	      v ^= v >>> 13;
	      if (j >= 0) {
	        w = (w + 0x61c88647) | 0;     // Weyl.
	        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
	        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
	      }
	    }
	    // We have detected all zeroes; make the key nonzero.
	    if (i >= 128) {
	      X[(seed && seed.length || 0) & 127] = -1;
	    }
	    // Run the generator 512 times to further mix the state before using it.
	    // Factoring this as a function slows the main generator, so it is just
	    // unrolled here.  The weyl generator is not advanced while warming up.
	    i = 127;
	    for (j = 4 * 128; j > 0; --j) {
	      v = X[(i + 34) & 127];
	      t = X[i = ((i + 1) & 127)];
	      v ^= v << 13;
	      t ^= t << 17;
	      v ^= v >>> 15;
	      t ^= t >>> 12;
	      X[i] = v ^ t;
	    }
	    // Storing state as object members is faster than using closure variables.
	    me.w = w;
	    me.X = X;
	    me.i = i;
	  }

	  init(me, seed);
	}

	function copy(f, t) {
	  t.i = f.i;
	  t.w = f.w;
	  t.X = f.X.slice();
	  return t;
	}
	function impl(seed, opts) {
	  if (seed == null) { seed = +(new Date); }
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (state.X) { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xor4096 = impl;
	}

	})(
	  commonjsGlobal,                                     // window object or global
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var tychei = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "Tyche-i" prng algorithm by
	// Samuel Neves and Filipe Araujo.
	// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  // Set up generator function.
	  me.next = function() {
	    var b = me.b, c = me.c, d = me.d, a = me.a;
	    b = (b << 25) ^ (b >>> 7) ^ c;
	    c = (c - d) | 0;
	    d = (d << 24) ^ (d >>> 8) ^ a;
	    a = (a - b) | 0;
	    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
	    me.c = c = (c - d) | 0;
	    me.d = (d << 16) ^ (c >>> 16) ^ a;
	    return me.a = (a - b) | 0;
	  };

	  /* The following is non-inverted tyche, which has better internal
	   * bit diffusion, but which is about 25% slower than tyche-i in JS.
	  me.next = function() {
	    var a = me.a, b = me.b, c = me.c, d = me.d;
	    a = (me.a + me.b | 0) >>> 0;
	    d = me.d ^ a; d = d << 16 ^ d >>> 16;
	    c = me.c + d | 0;
	    b = me.b ^ c; b = b << 12 ^ d >>> 20;
	    me.a = a = a + b | 0;
	    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
	    me.c = c = c + d | 0;
	    b = b ^ c;
	    return me.b = (b << 7 ^ b >>> 25);
	  }
	  */

	  me.a = 0;
	  me.b = 0;
	  me.c = 2654435769 | 0;
	  me.d = 1367130551;

	  if (seed === Math.floor(seed)) {
	    // Integer seed.
	    me.a = (seed / 0x100000000) | 0;
	    me.b = seed | 0;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 20; k++) {
	    me.b ^= strseed.charCodeAt(k) | 0;
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.a = f.a;
	  t.b = f.b;
	  t.c = f.c;
	  t.d = f.d;
	  return t;
	}
	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') { copy(state, xg); }
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.tychei = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var empty = {};

	var empty$1 = /*#__PURE__*/Object.freeze({
		default: empty
	});

	var require$$0 = ( empty$1 && empty ) || empty$1;

	var seedrandom = createCommonjsModule(function (module) {
	/*
	Copyright 2014 David Bau.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	*/

	(function (pool, math) {
	//
	// The following constants are related to IEEE 754 limits.
	//

	// Detect the global object, even if operating in strict mode.
	// http://stackoverflow.com/a/14387057/265298
	var global = (0, eval)('this'),
	    width = 256,        // each RC4 output is 0 <= x < 256
	    chunks = 6,         // at least six RC4 outputs for each double
	    digits = 52,        // there are 52 significant digits in a double
	    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
	    startdenom = math.pow(width, chunks),
	    significance = math.pow(2, digits),
	    overflow = significance * 2,
	    mask = width - 1,
	    nodecrypto;         // node.js crypto module, initialized at the bottom.

	//
	// seedrandom()
	// This is the seedrandom function described above.
	//
	function seedrandom(seed, options, callback) {
	  var key = [];
	  options = (options == true) ? { entropy: true } : (options || {});

	  // Flatten the seed string or build one from local entropy if needed.
	  var shortseed = mixkey(flatten(
	    options.entropy ? [seed, tostring(pool)] :
	    (seed == null) ? autoseed() : seed, 3), key);

	  // Use the seed to initialize an ARC4 generator.
	  var arc4 = new ARC4(key);

	  // This function returns a random double in [0, 1) that contains
	  // randomness in every bit of the mantissa of the IEEE 754 value.
	  var prng = function() {
	    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
	        d = startdenom,                 //   and denominator d = 2 ^ 48.
	        x = 0;                          //   and no 'extra last byte'.
	    while (n < significance) {          // Fill up all significant digits by
	      n = (n + x) * width;              //   shifting numerator and
	      d *= width;                       //   denominator and generating a
	      x = arc4.g(1);                    //   new least-significant-byte.
	    }
	    while (n >= overflow) {             // To avoid rounding up, before adding
	      n /= 2;                           //   last byte, shift everything
	      d /= 2;                           //   right using integer math until
	      x >>>= 1;                         //   we have exactly the desired bits.
	    }
	    return (n + x) / d;                 // Form the number within [0, 1).
	  };

	  prng.int32 = function() { return arc4.g(4) | 0; };
	  prng.quick = function() { return arc4.g(4) / 0x100000000; };
	  prng.double = prng;

	  // Mix the randomness into accumulated entropy.
	  mixkey(tostring(arc4.S), pool);

	  // Calling convention: what to return as a function of prng, seed, is_math.
	  return (options.pass || callback ||
	      function(prng, seed, is_math_call, state) {
	        if (state) {
	          // Load the arc4 state from the given state if it has an S array.
	          if (state.S) { copy(state, arc4); }
	          // Only provide the .state method if requested via options.state.
	          prng.state = function() { return copy(arc4, {}); };
	        }

	        // If called as a method of Math (Math.seedrandom()), mutate
	        // Math.random because that is how seedrandom.js has worked since v1.0.
	        if (is_math_call) { math[rngname] = prng; return seed; }

	        // Otherwise, it is a newer calling convention, so return the
	        // prng directly.
	        else { return prng; }
	      })(
	  prng,
	  shortseed,
	  'global' in options ? options.global : (this == math),
	  options.state);
	}
	math['seed' + rngname] = seedrandom;

	//
	// ARC4
	//
	// An ARC4 implementation.  The constructor takes a key in the form of
	// an array of at most (width) integers that should be 0 <= x < (width).
	//
	// The g(count) method returns a pseudorandom integer that concatenates
	// the next (count) outputs from ARC4.  Its return value is a number x
	// that is in the range 0 <= x < (width ^ count).
	//
	function ARC4(key) {
	  var t, keylen = key.length,
	      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

	  // The empty key [] is treated as [0].
	  if (!keylen) { key = [keylen++]; }

	  // Set up S using the standard key scheduling algorithm.
	  while (i < width) {
	    s[i] = i++;
	  }
	  for (i = 0; i < width; i++) {
	    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
	    s[j] = t;
	  }

	  // The "g" method returns the next (count) outputs as one number.
	  (me.g = function(count) {
	    // Using instance members instead of closure state nearly doubles speed.
	    var t, r = 0,
	        i = me.i, j = me.j, s = me.S;
	    while (count--) {
	      t = s[i = mask & (i + 1)];
	      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
	    }
	    me.i = i; me.j = j;
	    return r;
	    // For robust unpredictability, the function call below automatically
	    // discards an initial batch of values.  This is called RC4-drop[256].
	    // See http://google.com/search?q=rsa+fluhrer+response&btnI
	  })(width);
	}

	//
	// copy()
	// Copies internal state of ARC4 to or from a plain object.
	//
	function copy(f, t) {
	  t.i = f.i;
	  t.j = f.j;
	  t.S = f.S.slice();
	  return t;
	}
	//
	// flatten()
	// Converts an object tree to nested arrays of strings.
	//
	function flatten(obj, depth) {
	  var result = [], typ = (typeof obj), prop;
	  if (depth && typ == 'object') {
	    for (prop in obj) {
	      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
	    }
	  }
	  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
	}

	//
	// mixkey()
	// Mixes a string seed into a key that is an array of integers, and
	// returns a shortened string seed that is equivalent to the result key.
	//
	function mixkey(seed, key) {
	  var stringseed = seed + '', smear, j = 0;
	  while (j < stringseed.length) {
	    key[mask & j] =
	      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
	  }
	  return tostring(key);
	}

	//
	// autoseed()
	// Returns an object for autoseeding, using window.crypto and Node crypto
	// module if available.
	//
	function autoseed() {
	  try {
	    var out;
	    if (nodecrypto && (out = nodecrypto.randomBytes)) {
	      // The use of 'out' to remember randomBytes makes tight minified code.
	      out = out(width);
	    } else {
	      out = new Uint8Array(width);
	      (global.crypto || global.msCrypto).getRandomValues(out);
	    }
	    return tostring(out);
	  } catch (e) {
	    var browser = global.navigator,
	        plugins = browser && browser.plugins;
	    return [+new Date, global, plugins, global.screen, tostring(pool)];
	  }
	}

	//
	// tostring()
	// Converts an array of charcodes to a string
	//
	function tostring(a) {
	  return String.fromCharCode.apply(0, a);
	}

	//
	// When seedrandom.js is loaded, we immediately mix a few bits
	// from the built-in RNG into the entropy pool.  Because we do
	// not want to interfere with deterministic PRNG state later,
	// seedrandom will not call math.random on its own again after
	// initialization.
	//
	mixkey(math.random(), pool);

	//
	// Nodejs and AMD support: export the implementation as a module using
	// either convention.
	//
	if (module.exports) {
	  module.exports = seedrandom;
	  // When in node.js, try using crypto package for autoseeding.
	  try {
	    nodecrypto = require$$0;
	  } catch (ex) {}
	}

	// End anonymous scope, and pass initial values.
	})(
	  [],     // pool: entropy pool starts empty
	  Math    // math: package containing random, pow, and seedrandom
	);
	});

	// A library of seedable RNGs implemented in Javascript.
	//
	// Usage:
	//
	// var seedrandom = require('seedrandom');
	// var random = seedrandom(1); // or any seed.
	// var x = random();       // 0 <= x < 1.  Every bit is random.
	// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

	// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
	// Period: ~2^116
	// Reported to pass all BigCrush tests.


	// xor128, a pure xor-shift generator by George Marsaglia.
	// Period: 2^128-1.
	// Reported to fail: MatrixRank and LinearComp.


	// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
	// Period: 2^192-2^32
	// Reported to fail: CollisionOver, SimpPoker, and LinearComp.


	// xorshift7, by François Panneton and Pierre L'ecuyer, takes
	// a different approach: it adds robustness by allowing more shifts
	// than Marsaglia's original three.  It is a 7-shift generator
	// with 256 bits, that passes BigCrush with no systmatic failures.
	// Period 2^256-1.
	// No systematic BigCrush failures reported.


	// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
	// very long period that also adds a Weyl generator. It also passes
	// BigCrush with no systematic failures.  Its long period may
	// be useful if you have many generators and need to avoid
	// collisions.
	// Period: 2^4128-2^32.
	// No systematic BigCrush failures reported.


	// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
	// number generator derived from ChaCha, a modern stream cipher.
	// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
	// Period: ~2^127
	// No systematic BigCrush failures reported.


	// The original ARC4-based prng included in this library.
	// Period: ~2^1600


	seedrandom.alea = alea;
	seedrandom.xor128 = xor128;
	seedrandom.xorwow = xorwow;
	seedrandom.xorshift7 = xorshift7;
	seedrandom.xor4096 = xor4096;
	seedrandom.tychei = tychei;

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

	  return new InternalNode(split, left, right);
	}


	function build (data, ids, codes, first, last) {
	  if (last - first === 0) { return new Leaf(codes[first], data[ids[first]]); }
	  var split = findSplit(codes, first, last);
	  //const split = first + ((last - first) >> 1);
	  var left  = build(data, ids, codes, first, split);
	  var right = build(data, ids, codes, split + 1, last);
	  return new InternalNode(split, left, right);
	}


	var Node = function Node (parent) {
	  this.code = 0;
	  //this.parent = parent;
	  this.left = null;
	  this.right= null;
	  this.data = null;
	};


	function buildIterative (data, ids, codes, start, end) {
	  var root    = new Node(null);
	  var Q     = [root];
	  var stack = [start, end];

	  while (Q.length !== 0) {
	    var last  = stack.pop();
	    var first = stack.pop();
	    var node  = Q.pop();

	    if (last - first === 0) {
	      node.code = codes[first];
	      node.data = data[ids[first]];
	    } else {
	      var split = findSplit(codes, first, last);
	      //const split = (first + last) >> 1;
	      node.code = split;

	      if (first <= split) {
	        node.left = new Node(split, node);
	        Q.push(node.left);
	        stack.push(first, split);
	      }

	      if (last > split) {
	        node.right = new Node(node);
	        Q.push(node.right);
	        stack.push(split + 1, last);
	      }
	    }
	  }
	  return root;
	}


	function buildIterativeBuckets (data, ids, codes, start, end, bucketSize) {
	  var root = new Node(null);
	  var Q = [root];
	  var stack = [start, end];

	  while (Q.length !== 0) {
	    var last  = stack.pop();
	    var first = stack.pop();
	    var node  = Q.pop();

	    if (last - first < bucketSize) {
	      var bucket = new Array(last - first + 1);
	      for (var i = first, j = 0; i <= last; i++, j++) { bucket[j] = data[ids[i]]; }
	      node.code = codes[first];
	      node.data = bucket;
	    } else {
	      var split = findSplit(codes, first, last);
	      node.code = split;

	      if (first <= split) {
	        node.left = new Node(split, node);
	        Q.push(node.left);
	        stack.push(first, split);
	      }

	      if (last > split) {
	        node.right = new Node(node);
	        Q.push(node.right);
	        stack.push(split + 1, last);
	      }
	    }
	  }
	  return root;
	}


	// count leading zeroes
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

	  if (f === l) { return first; }

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
	var PHTree = function PHTree (points, getX, getY, bucketSize, sfc, recursive) {
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
	    this._root = recursive
	      ? build(points, ids, codes, 0, n - 1)
	      : buildIterative(points, ids, codes, 0, n - 1);
	  } else {
	    this._root = recursive
	      ? buildBuckets(points, ids, codes, 0, n - 1, bucketSize)
	      : buildIterativeBuckets(points, ids, codes, 0, n - 1, bucketSize);
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

	/* follows "An implementation of top-down splaying"
	 * by D. Sleator <sleator@cs.cmu.edu> March 1992
	 */

	/**
	 * @typedef {*} Key
	 */


	/**
	 * @typedef {*} Value
	 */


	/**
	 * @typedef {function(node:Node):void} Visitor
	 */


	/**
	 * @typedef {function(a:Key, b:Key):number} Comparator
	 */


	/**
	 * @param {function(node:Node):string} NodePrinter
	 */


	/**
	 * @typedef {Object}  Node
	 * @property {Key}    Key
	 * @property {Value=} data
	 * @property {Node}   left
	 * @property {Node}   right
	 */

	var Node$1 = function Node (key, data) {
	  this.key  = key;
	  this.data = data;
	  this.left = null;
	  this.right= null;
	};

	function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }


	/**
	 * Simple top down splay, not requiring i to be in the tree t.
	 * @param {Key} i
	 * @param {Node?} t
	 * @param {Comparator} comparator
	 */
	function splay (i, t, comparator) {
	  if (t === null) { return t; }
	  var l, r, y;
	  var N = new Node$1();
	  l = r = N;

	  while (true) {
	    var cmp = comparator(i, t.key);
	    //if (i < t.key) {
	    if (cmp < 0) {
	      if (t.left === null) { break; }
	      //if (i < t.left.key) {
	      if (comparator(i, t.left.key) < 0) {
	        y = t.left;                           /* rotate right */
	        t.left = y.right;
	        y.right = t;
	        t = y;
	        if (t.left === null) { break; }
	      }
	      r.left = t;                               /* link right */
	      r = t;
	      t = t.left;
	    //} else if (i > t.key) {
	    } else if (cmp > 0) {
	      if (t.right === null) { break; }
	      //if (i > t.right.key) {
	      if (comparator(i, t.right.key) > 0) {
	        y = t.right;                          /* rotate left */
	        t.right = y.left;
	        y.left = t;
	        t = y;
	        if (t.right === null) { break; }
	      }
	      l.right = t;                              /* link left */
	      l = t;
	      t = t.right;
	    } else {
	      break;
	    }
	  }
	  /* assemble */
	  l.right = t.left;
	  r.left = t.right;
	  t.left = N.right;
	  t.right = N.left;
	  return t;
	}


	/**
	 * @param  {Key}        i
	 * @param  {Value}      data
	 * @param  {Comparator} comparator
	 * @param  {Tree}       tree
	 * @return {Node}      root
	 */
	function insert (i, data, t, comparator, tree) {
	  var node = new Node$1(i, data);

	  tree._size++;

	  if (t === null) {
	    node.left = node.right = null;
	    return node;
	  }

	  t = splay(i, t, comparator);
	  var cmp = comparator(i, t.key);
	  if (cmp < 0) {
	    node.left = t.left;
	    node.right = t;
	    t.left = null;
	  } else if (cmp >= 0) {
	    node.right = t.right;
	    node.left = t;
	    t.right = null;
	  }
	  return node;
	}


	/**
	 * Insert i into the tree t, unless it's already there.
	 * @param  {Key}        i
	 * @param  {Value}      data
	 * @param  {Comparator} comparator
	 * @param  {Tree}       tree
	 * @return {Node}       root
	 */
	function add (i, data, t, comparator, tree) {
	  var node = new Node$1(i, data);

	  if (t === null) {
	    node.left = node.right = null;
	    tree._size++;
	    return node;
	  }

	  t = splay(i, t, comparator);
	  var cmp = comparator(i, t.key);
	  if (cmp === 0) { return t; }
	  else {
	    if (cmp < 0) {
	      node.left = t.left;
	      node.right = t;
	      t.left = null;
	    } else if (cmp > 0) {
	      node.right = t.right;
	      node.left = t;
	      t.right = null;
	    }
	    tree._size++;
	    return node;
	  }
	}


	/**
	 * Deletes i from the tree if it's there
	 * @param {Key}        i
	 * @param {Tree}       tree
	 * @param {Comparator} comparator
	 * @param {Tree}       tree
	 * @return {Node}      new root
	 */
	function remove (i, t, comparator, tree) {
	  var x;
	  if (t === null) { return null; }
	  t = splay(i, t, comparator);
	  if (i === t.key) {               /* found it */
	    if (t.left === null) {
	      x = t.right;
	    } else {
	      x = splay(i, t.left, comparator);
	      x.right = t.right;
	    }
	    tree._size--;
	    return x;
	  }
	  return t;                         /* It wasn't there */
	}


	function split (key, v, comparator) {
	  var left, right;
	  if (v === null) {
	    left = right = null;
	  } else {
	    v = splay(key, v, comparator);

	    var cmp = comparator(v.key, key);
	    if (cmp === 0) {
	      left  = v.left;
	      right = v.right;
	    } else if (cmp < 0) {
	      right   = v.right;
	      v.right = null;
	      left    = v;
	    } else {
	      left   = v.left;
	      v.left = null;
	      right  = v;
	    }
	  }
	  return { left: left, right: right };
	}


	function merge (left, right, comparator) {
	  if (right === null) { return left; }
	  if (left  === null) { return right; }

	  right = splay(left.key, right, comparator);
	  right.left = left;
	  return right;
	}


	/**
	 * Prints level of the tree
	 * @param  {Node}                        root
	 * @param  {String}                      prefix
	 * @param  {Boolean}                     isTail
	 * @param  {Array<string>}               out
	 * @param  {Function(node:Node):String}  printNode
	 */
	function printRow (root, prefix, isTail, out, printNode) {
	  if (root) {
	    out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
	    var indent = prefix + (isTail ? '    ' : '│   ');
	    if (root.left)  { printRow(root.left,  indent, false, out, printNode); }
	    if (root.right) { printRow(root.right, indent, true,  out, printNode); }
	  }
	}


	var Tree = function Tree (comparator) {
	  if ( comparator === void 0 ) comparator = DEFAULT_COMPARE;

	  this._comparator = comparator;
	  this._root = null;
	  this._size = 0;
	};

	var prototypeAccessors = { size: { configurable: true } };


	/**
	 * Inserts a key, allows duplicates
	 * @param{Key}  key
	 * @param{Value=} data
	 * @return {Node|null}
	 */
	Tree.prototype.insert = function insert$1 (key, data) {
	  return this._root = insert(key, data, this._root, this._comparator, this);
	};


	/**
	 * Adds a key, if it is not present in the tree
	 * @param{Key}  key
	 * @param{Value=} data
	 * @return {Node|null}
	 */
	Tree.prototype.add = function add$1 (key, data) {
	  return this._root = add(key, data, this._root, this._comparator, this);
	};


	/**
	 * @param{Key} key
	 * @return {Node|null}
	 */
	Tree.prototype.remove = function remove$1 (key) {
	  this._root = remove(key, this._root, this._comparator, this);
	};


	/**
	 * Removes and returns the node with smallest key
	 * @return {?Node}
	 */
	Tree.prototype.pop = function pop () {
	  var node = this._root;
	  if (node) {
	    while (node.left) { node = node.left; }
	    this._root = splay(node.key,this._root, this._comparator);
	    this._root = remove(node.key, this._root, this._comparator, this);
	    return { key: node.key, data: node.data };
	  }
	  return null;
	};


	/**
	 * @param{Key} key
	 * @return {Node|null}
	 */
	Tree.prototype.findStatic = function findStatic (key) {
	  var current = this._root;
	  var compare = this._comparator;
	  while (current) {
	    var cmp = compare(key, current.key);
	    if (cmp === 0)  { return current; }
	    else if (cmp < 0) { current = current.left; }
	    else            { current = current.right; }
	  }
	  return null;
	};


	/**
	 * @param{Key} key
	 * @return {Node|null}
	 */
	Tree.prototype.find = function find (key) {
	  if (this._root) {
	    this._root = splay(key, this._root, this._comparator);
	    if (this._comparator(key, this._root.key) !== 0) { return null; }
	  }
	  return this._root;
	};


	/**
	 * @param{Key} key
	 * @return {Boolean}
	 */
	Tree.prototype.contains = function contains (key) {
	  var current = this._root;
	  var compare = this._comparator;
	  while (current) {
	    var cmp = compare(key, current.key);
	    if (cmp === 0)  { return true; }
	    else if (cmp < 0) { current = current.left; }
	    else            { current = current.right; }
	  }
	  return false;
	};


	/**
	 * @param{Visitor} visitor
	 * @param{*=}    ctx
	 * @return {SplayTree}
	 */
	Tree.prototype.forEach = function forEach (visitor, ctx) {
	  var current = this._root;
	  var Q = [];/* Initialize stack s */
	  var done = false;

	  while (!done) {
	    if (current !==null) {
	      Q.push(current);
	      current = current.left;
	    } else {
	      if (Q.length !== 0) {
	        current = Q.pop();
	        visitor.call(ctx, current);

	        current = current.right;
	      } else { done = true; }
	    }
	  }
	  return this;
	};


	/**
	 * Walk key range from `low` to `high`. Stops if `fn` returns a value.
	 * @param{Key}    low
	 * @param{Key}    high
	 * @param{Function} fn
	 * @param{*?}     ctx
	 * @return {SplayTree}
	 */
	Tree.prototype.range = function range (low, high, fn, ctx) {
	    var this$1 = this;

	  var Q = [];
	  var compare = this._comparator;
	  var node = this._root, cmp;

	  while (Q.length !== 0 || node) {
	    if (node) {
	      Q.push(node);
	      node = node.left;
	    } else {
	      node = Q.pop();
	      cmp = compare(node.key, high);
	      if (cmp > 0) {
	        break;
	      } else if (compare(node.key, low) >= 0) {
	        if (fn.call(ctx, node)) { return this$1; } // stop if smth is returned
	      }
	      node = node.right;
	    }
	  }
	  return this;
	};


	/**
	 * Returns array of keys
	 * @return {Array<Key>}
	 */
	Tree.prototype.keys = function keys () {
	  var keys = [];
	  this.forEach(function (ref) {
	      var key = ref.key;

	      return keys.push(key);
	    });
	  return keys;
	};


	/**
	 * Returns array of all the data in the nodes
	 * @return {Array<Value>}
	 */
	Tree.prototype.values = function values () {
	  var values = [];
	  this.forEach(function (ref) {
	      var data = ref.data;

	      return values.push(data);
	    });
	  return values;
	};


	/**
	 * @return {Key|null}
	 */
	Tree.prototype.min = function min () {
	  if (this._root) { return this.minNode(this._root).key; }
	  return null;
	};


	/**
	 * @return {Key|null}
	 */
	Tree.prototype.max = function max () {
	  if (this._root) { return this.maxNode(this._root).key; }
	  return null;
	};


	/**
	 * @return {Node|null}
	 */
	Tree.prototype.minNode = function minNode (t) {
	    if ( t === void 0 ) t = this._root;

	  if (t) { while (t.left) { t = t.left; } }
	  return t;
	};


	/**
	 * @return {Node|null}
	 */
	Tree.prototype.maxNode = function maxNode (t) {
	    if ( t === void 0 ) t = this._root;

	  if (t) { while (t.right) { t = t.right; } }
	  return t;
	};


	/**
	 * Returns node at given index
	 * @param{number} index
	 * @return {?Node}
	 */
	Tree.prototype.at = function at (index) {
	  var current = this._root, done = false, i = 0;
	  var Q = [];

	  while (!done) {
	    if (current) {
	      Q.push(current);
	      current = current.left;
	    } else {
	      if (Q.length > 0) {
	        current = Q.pop();
	        if (i === index) { return current; }
	        i++;
	        current = current.right;
	      } else { done = true; }
	    }
	  }
	  return null;
	};


	/**
	 * @param{Node} d
	 * @return {Node|null}
	 */
	Tree.prototype.next = function next (d) {
	  var root = this._root;
	  var successor = null;

	  if (d.right) {
	    successor = d.right;
	    while (successor.left) { successor = successor.left; }
	    return successor;
	  }

	  var comparator = this._comparator;
	  while (root) {
	    var cmp = comparator(d.key, root.key);
	    if (cmp === 0) { break; }
	    else if (cmp < 0) {
	      successor = root;
	      root = root.left;
	    } else { root = root.right; }
	  }

	  return successor;
	};


	/**
	 * @param{Node} d
	 * @return {Node|null}
	 */
	Tree.prototype.prev = function prev (d) {
	  var root = this._root;
	  var predecessor = null;

	  if (d.left !== null) {
	    predecessor = d.left;
	    while (predecessor.right) { predecessor = predecessor.right; }
	    return predecessor;
	  }

	  var comparator = this._comparator;
	  while (root) {
	    var cmp = comparator(d.key, root.key);
	    if (cmp === 0) { break; }
	    else if (cmp < 0) { root = root.left; }
	    else {
	      predecessor = root;
	      root = root.right;
	    }
	  }
	  return predecessor;
	};


	/**
	 * @return {SplayTree}
	 */
	Tree.prototype.clear = function clear () {
	  this._root = null;
	  this._size = 0;
	  return this;
	};


	/**
	 * @return {NodeList}
	 */
	Tree.prototype.toList = function toList$1 () {
	  return toList(this._root);
	};


	/**
	 * Bulk-load items. Both array have to be same size
	 * @param{Array<Key>}  keys
	 * @param{Array<Value>}[values]
	 * @param{Boolean}     [presort=false] Pre-sort keys and values, using
	 *                                       tree's comparator. Sorting is done
	 *                                       in-place
	 * @return {AVLTree}
	 */
	Tree.prototype.load = function load (keys, values, presort) {
	    if ( keys === void 0 ) keys = [];
	    if ( values === void 0 ) values = [];
	    if ( presort === void 0 ) presort = false;

	  var size = keys.length;
	  var comparator = this._comparator;

	  // sort if needed
	  if (presort) { sort$1(keys, values, 0, size - 1, comparator); }

	  if (this._root === null) { // empty tree
	    this._root = loadRecursive(this._root, keys, values, 0, size);
	    this._size = size;
	  } else { // that re-builds the whole tree from two in-order traversals
	    var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
	    size = this._size + size;
	    this._root = sortedListToBST({ head: mergedList }, 0, size);
	  }
	  return this;
	};


	/**
	 * @return {Boolean}
	 */
	Tree.prototype.isEmpty = function isEmpty () { return this._root === null; };

	prototypeAccessors.size.get = function () { return this._size; };


	/**
	 * @param{NodePrinter=} printNode
	 * @return {String}
	 */
	Tree.prototype.toString = function toString (printNode) {
	    if ( printNode === void 0 ) printNode = function (n) { return n.key; };

	  var out = [];
	  printRow(this._root, '', true, function (v) { return out.push(v); }, printNode);
	  return out.join('');
	};


	Tree.prototype.update = function update (key, newKey, newData) {
	  var comparator = this._comparator;
	  var ref = split(key, this._root, comparator);
	    var left = ref.left;
	    var right = ref.right;
	  this._size--;
	  if (comparator(key, newKey) < 0) {
	    right = insert(newKey, newData, right, comparator, this);
	  } else {
	    left = insert(newKey, newData, left, comparator, this);
	  }
	  this._root = merge(left, right, comparator);
	};


	Tree.prototype.split = function split$1 (key) {
	  return split(key, this._root, this._comparator);
	};

	Object.defineProperties( Tree.prototype, prototypeAccessors );


	function loadRecursive (parent, keys, values, start, end) {
	  var size = end - start;
	  if (size > 0) {
	    var middle = start + Math.floor(size / 2);
	    var key    = keys[middle];
	    var data   = values[middle];
	    var node   = { key: key, data: data, parent: parent };
	    node.left    = loadRecursive(node, keys, values, start, middle);
	    node.right   = loadRecursive(node, keys, values, middle + 1, end);
	    return node;
	  }
	  return null;
	}


	function createList(keys, values) {
	  var head = { next: null };
	  var p = head;
	  for (var i = 0; i < keys.length; i++) {
	    p = p.next = { key: keys[i], data: values[i] };
	  }
	  p.next = null;
	  return head.next;
	}


	function toList (root) {
	  var current = root;
	  var Q = [], done = false;

	  var head = { next: null };
	  var p = head;

	  while (!done) {
	    if (current) {
	      Q.push(current);
	      current = current.left;
	    } else {
	      if (Q.length > 0) {
	        current = p = p.next = Q.pop();
	        current = current.right;
	      } else { done = true; }
	    }
	  }
	  p.next = null; // that'll work even if the tree was empty
	  return head.next;
	}


	function sortedListToBST(list, start, end) {
	  var size = end - start;
	  if (size > 0) {
	    var middle = start + Math.floor(size / 2);
	    var left = sortedListToBST(list, start, middle);

	    var root = list.head;
	    root.left = left;

	    list.head = list.head.next;

	    root.right = sortedListToBST(list, middle + 1, end);
	    return root;
	  }
	  return null;
	}


	function mergeLists (l1, l2, compare) {
	  if ( compare === void 0 ) compare = function (a, b) { return a - b; };

	  var head = {}; // dummy
	  var p = head;

	  var p1 = l1;
	  var p2 = l2;

	  while (p1 !== null && p2 !== null) {
	    if (compare(p1.key, p2.key) < 0) {
	      p.next = p1;
	      p1 = p1.next;
	    } else {
	      p.next = p2;
	      p2 = p2.next;
	    }
	    p = p.next;
	  }

	  if (p1 !== null)      { p.next = p1; }
	  else if (p2 !== null) { p.next = p2; }

	  return head.next;
	}


	function sort$1(keys, values, left, right, compare) {
	  if (left >= right) { return; }

	  var pivot = keys[(left + right) >> 1];
	  var i = left - 1;
	  var j = right + 1;

	  while (true) {
	    do { i++; } while (compare(keys[i], pivot) < 0);
	    do { j--; } while (compare(keys[j], pivot) > 0);
	    if (i >= j) { break; }

	    var tmp = keys[i];
	    keys[i] = keys[j];
	    keys[j] = tmp;

	    tmp = values[i];
	    values[i] = values[j];
	    values[j] = tmp;
	  }

	  sort$1(keys, values,  left,     j, compare);
	  sort$1(keys, values, j + 1, right, compare);
	}

	var defaultGetX = function (d) { return d.x; };
	var defaultGetY = function (d) { return d.y; };

	var HILBERT$1 = 1;


	var UBTree = function UBTree (data, getX, getY, sfc) {
			var this$1 = this;
			if ( getX === void 0 ) getX = defaultGetX;
			if ( getY === void 0 ) getY = defaultGetY;
			if ( sfc === void 0 ) sfc = HILBERT$1;

			this._tree = new Tree();

	  var n = data.length;
	  var minX = Infinity, minY = Infinity,
	      maxX = -Infinity, maxY = -Infinity;
	  var p, i, x, y;

	  this._x = getX;
	  this._y = getY;

	  var project = sfc === HILBERT$1 ? hilbert : morton_1;
	  this._project = project;

	  for (i = 0; i < n; i++) {
	    p = data[i];
	    x = getX(p);
	    y = getY(p);
	    if (x < minX) { minX = x; }
	    if (y < minY) { minY = y; }
	    if (x > maxX) { maxX = x; }
	    if (y > maxY) { maxY = y; }
	  }

	  this._minX = minX;
	  this._minY = minY;
	  this._maxX = maxX;
	  this._maxY = maxY;

	  var max = (1 << 16) - 1;
	  var w = max / (maxX - minX);
	  var h = max / (maxY - minY);

			for (i = 0; i < n; i++) {
				p = data[i];
				this$1._tree.insert(project(w * (getX(p) - minX), h * (getY(p) - minY)), p);
			}

			this._root = this._tree._root;
		};


	UBTree.prototype.inOrder   = inOrder;
	UBTree.prototype.preOrder  = preOrder;
	UBTree.prototype.postOrder = postOrder;
	UBTree.prototype.map       = map;
	UBTree.prototype.height    = height;
	UBTree.prototype.size      = size;
	UBTree.prototype.toString  = toString;

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
	  var d3 = ax * ax + ay * ay - ar * ar - cx * cx - cy * cy + cr * cr;
	  var ab = a3 * b2 - a2 * b3,
	    xa = (b2 * d3 - b3 * d2) / ab - ax,
	    xb = (b3 * c2 - b2 * c3) / ab,
	    ya = (a3 * d2 - a2 * d3) / ab - ay,
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
	  if ( n === void 0 ) n = points.length;

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

	Math.seedrandom('query');

	var svg = d3.select("svg");
	var width  = document.documentElement.clientWidth;
	var height$1 = document.documentElement.clientHeight;
	svg.attr("width", width);
	svg.attr("height", height$1);

	var random = Math.random, n = 1000;

	var data = window.data = d3.range(n).map(function() {
	  return [random() * width, random() * height$1];
	});
	// var data = new Array(n).fill(0).map((_, i) => {
	//   return i < (n / 2) ?
	//     [width / 4 * random(), height / 4 * random()] :
	//     [width * random(), height * random()];
	// });

	// const cells = Math.sqrt(n) | 0;
	// let x = width / cells / 2, y = -height / cells / 2;
	// const data = new Array(n).fill(0).map((_, i) => {
	//   if (i % cells === 0) {
	//     y += height / cells;
	//     x = width / cells / 2;
	//   }
	//   const pt = [ x, y ];
	//   x += width / cells;
	//   return pt;
	// });

	var nodeSize = /bucket/.test(window.location.hash) ? (Math.log(n) | 0) : 0;
	console.time('build');
	var tree = new PHTree(data, function (p) { return p[0]; }, function (p) { return p[1]; }, nodeSize, PHTree.SFC.HILBERT);
	console.timeEnd('build');

	// console.time('build sfc');
	// var tree = new sfctree(data, p => p[0], p => p[1], nodeSize, 'hilbert');
	// console.timeEnd('build sfc');

	console.time('quadtree');
	var quadtree = new d3.quadtree(data, function (p) { return p[0]; }, function (p) { return p[1]; });
	console.timeEnd('quadtree');

	console.time('ubtree');
	var u = new UBTree(data, function (p) { return p[0]; }, function (p) { return p[1]; });
	console.timeEnd('ubtree');
	window.u = u;
	window.tree = tree;
	window.phtree = PHTree;

	svg
	  .append('path')
	  .attr('d', d3.line()
	    .x(function (d) { return d[0]; })
	    .y(function (d) { return d[1]; })(getData(tree)))
	  .attr('stroke-width', 2)
	  .attr('fill', 'none')
	  .attr('stroke', 'darkblue')
	  .attr('stroke-opacity', 0.25);

	var brush = d3.brush()
	    .on("brush", brushed);

	var point = svg.selectAll(".point")
	  .data(data)
	  .enter().append("circle")
	    .attr("class", "point")
	    .attr("cx", function (d) { return d[0]; })
	    .attr("cy", function (d) { return d[1]; })
	    .attr("r", 2);

	svg.append("g")
	    .attr("class", "brush")
	    .call(brush)
	    .call(brush.move, [[100, 100], [200, 200]]);

	function brushed() {
	  var extent = d3.event.selection;
	  point.each(function(d) { d.scanned = d.selected = false; });
	  search(tree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
	  point.classed("point--scanned", function(d) { return d.scanned; });
	  point.classed("point--selected", function(d) { return d.selected; });
	  point.classed("point--focus", function(d) { return d.focus; });
	}

	function show () {
	  point.classed("point--selected", function(d) { return d.selected; });
	  point.classed("point--scanned", function(d) { return d.scanned; });
	  point.classed("point--focus", function(d) { return d.focus; });
	}

	// Find the nodes within the specified rectangle.
	function search(tree, x0, y0, x3, y3) {
	  tree.query(x0, y0, x3, y3).map(function (point) {
	    point.selected = true;
	  });
	  // quadtree.visit(function(node, x1, y1, x2, y2) {
	  //   if (!node.length) {
	  //     do {
	  //       var d = node.data;
	  //       d.scanned = true;
	  //       d.selected = (d[0] >= x0) && (d[0] < x3) && (d[1] >= y0) && (d[1] < y3);
	  //     } while (node = node.next);
	  //   }
	  //   return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
	  // });
	}

	// Collapse the quadtree into an array of rectangles.
	function nodes(tree) {
	  var nodes = [];
	  // tree.walk((node, x0, y0, x1, y1) => {
	  //   node.x0 = x0, node.y0 = y0;
	  //   node.x1 = x1, node.y1 = y1;
	  //   nodes.push(node);
	  // });
	  var collect = tree._bucketSize === 0
	    ? function (n) { if (!n.data) { nodes.push(n); } }
	    : function (n) { nodes.push(n); };
	  tree.postOrder(getTightBoxes);
	  tree.preOrder(collect);
	  return nodes;
	}

	function getTightBoxes(node) {
	  var xmin = tree._maxX, ymin = tree._maxY,
	      xmax = tree._minX, ymax = tree._minY;
	  if (node.data) {
	    //const data = node.data;
	    if (tree._bucketSize !== 0) {
	      for (var i = 0; i < node.data.length; i++) {
	        var data = node.data[i];
	        var x = tree._x(data), y = tree._y(data);
	        xmin = Math.min(xmin, x);
	        ymin = Math.min(ymin, y);
	        xmax = Math.max(xmax, x);
	        ymax = Math.max(ymax, y);
	      }
	    } else {
	      xmin = xmax = tree._x(node.data);
	      ymin = ymax = tree._y(node.data);
	    }
	  } else {
	    var child = node.left;
	    if (child) {
	      xmin = Math.min(xmin, child.x0);
	      ymin = Math.min(ymin, child.y0);
	      xmax = Math.max(xmax, child.x1);
	      ymax = Math.max(ymax, child.y1);
	    }
	    child = node.right;
	    if (child) {
	      xmin = Math.min(xmin, child.x0);
	      ymin = Math.min(ymin, child.y0);
	      xmax = Math.max(xmax, child.x1);
	      ymax = Math.max(ymax, child.y1);
	    }
	  }

	  node.x0 = xmin;
	  node.y0 = ymin;
	  node.x1 = xmax;
	  node.y1 = ymax;
	}


	function getData(tree) {
	  var data = [];
	  tree.preOrder(function (n) {
	    if (n.data) {
	      if (tree._bucketSize !== 0) { data.push.apply(data, n.data); }
	      else { data.push(n.data); }
	    }
	  });
	  return data;
	}


	console.time('bbox');
	tree.postOrder(getTightBoxes);
	console.timeEnd('bbox');


	console.time('circles');
	tree.postOrder(function (node) {
	  var cx, cy, r, m, child;
	  if (node.data) {
	    if (tree._bucketSize) {
	      var circle = minDisc(node.data, [], node.data.length, tree._x, tree._y, function () { return 1; });
	      cx = circle[0]; cy = circle[1]; r = circle[2];
	      m = node.data.length; // mass
	    } else {
	      cx = tree._x(node.data);
	      cy = tree._y(node.data);
	      r = 0;
	      m = 1; // mass
	    }
	  } else {
	    if (node.left && node.right) {
	      var ax = node.left.cx,  ay = node.left.cy;
	      var bx = node.right.cx, by = node.right.cy;
	      var ar = node.left.r, br = node.right.r;
	      var dx = bx - ax, dy = by - ay;

	      var dr = br - ar;
	      var l = Math.sqrt(dx * dx + dy * dy);

	      cx = (ax + bx + dx / l * dr) / 2;
	      cy = (ay + by + dy / l * dr) / 2;
	      r = (l + ar + br) / 2;

	      m = node.left.mass + node.right.mass; // mass
	    } else {
	      child = node.left || node.right;
	      cx = child.cx;
	      cy = child.cy;
	      r = child.r;

	      m = child.mass; // mass
	    }
	  }

	  node.cx   = cx;
	  node.cy   = cy;
	  node.r    = r;
	  node.mass = m;
	});
	console.timeEnd('circles');

	tree.preOrder(function (n) { return (n.fx = n.fy = 0); });

	var theta = 0.6;
	console.time('collect leafs');
	var bodies = new Array(data.length);
	var datas  = new Array(data.length);
	(function () { // collect leafs
	  var pos = 0;
	  if (tree._bucketSize === 0) {
	    tree.preOrder(function (n) {
	      if (n.data) {
	        bodies[pos] = n;
	        datas[pos] = n.data;
	        pos++;
	      }
	    });
	  } else {
	    tree.preOrder(function (n) {
	      if (n.data) {
	        for (var i = 0; i < n.data.length; i++) {
	          bodies[pos] = n;
	          datas[pos]  = n.data;
	          pos++;
	        }
	      }
	    });
	  }
	})();
	console.timeEnd('collect leafs');

	console.time('bst tight');
	u.postOrder(getTightBoxesBST);
	console.timeEnd('bst tight');

	console.time('ubtree accumulate');
	u.postOrder(function (node) {
	  var cx, cy, r, m, child;

	  cx = tree._x(node.data);
	  cy = tree._y(node.data);
	  r = 1;
	  m = 1; // mass

	  child = node.left;
	  if (child) {
	    var ax = cx,  ay = cy;
	    var bx = child.cx, by = child.cy;
	    var ar = r, br = child.r;
	    var dx = bx - ax, dy = by - ay;

	    var dr = br - ar;
	    var l = Math.sqrt(dx * dx + dy * dy);

	    cx = (ax + bx + dx / l * dr) / 2;
	    cy = (ay + by + dy / l * dr) / 2;
	    r = (l + ar + br) / 2;

	    m += child.mass;
	  }

	  child = node.right;
	  if (child) {
	    var ax$1 = cx,  ay$1 = cy;
	    var bx$1 = child.cx, by$1 = child.cy;
	    var ar$1 = r, br$1 = child.r;
	    var dx$1 = bx$1 - ax$1, dy$1 = by$1 - ay$1;

	    var dr$1 = br$1 - ar$1;
	    var l$1 = Math.sqrt(dx$1 * dx$1 + dy$1 * dy$1);

	    cx = (ax$1 + bx$1 + dx$1 / l$1 * dr$1) / 2;
	    cy = (ay$1 + by$1 + dy$1 / l$1 * dr$1) / 2;
	    r = (l$1 + ar$1 + br$1) / 2;

	    m += child.mass;
	  }

	  node.cx   = cx;
	  node.cy   = cy;
	  node.r    = r;
	  node.mass = m;
	});
	console.timeEnd('ubtree accumulate');


	(function () {
	  var cur = bodies[n >> 1];
	  var pt = datas[n >> 1];
	  pt.selected = true;
	  pt.focus    = true;
	  cur.focus   = true;


	  if (tree._bucketSize !== 0) {
	    pt.forEach(function (p) { return p.focus = true; });
	  }

	  tree.preOrder(function (node) {
	    if (node !== cur) {
	      if (node.data) {
	        if (tree._bucketSize === 0) {
	          node.data.selected = true;
	        } else {
	          var dx = cur.cx - node.cx;
	          var dy = cur.cy - node.cy;
	          var dsq = dx * dx + dy * dy;
	          var rmax = cur.r + node.r;
	          if (dsq >= (rmax / theta) * (rmax / theta)) {
	            node.scanned = true;
	          } else {
	            for (var i = 0; i < node.data.length; i++) {
	              node.data[i].selected = true;
	            }
	          }
	        }
	      } else {
	        var dx$1 = cur.cx - node.cx;
	        var dy$1 = cur.cy - node.cy;
	        var dsq$1 = dx$1 * dx$1 + dy$1 * dy$1;
	        var rmax$1 = cur.r + node.r / theta;

	        if (dsq$1 >= (rmax$1 / theta) * (rmax$1 / theta)) {
	          node.scanned = true;
	          return true;
	        }
	      }
	    }
	  });
	  show();
	}) ();


	quadtree.visitAfter(function (quad) {
	  var strength = 0, q, c, weight = 0, x, y, i;

	  // For internal nodes, accumulate forces from child quadrants.
	  if (quad.length) {
	    for (x = y = i = 0; i < 4; ++i) {
	      if ((q = quad[i]) && (c = Math.abs(q.value))) {
	        strength += q.value, weight += c, x += c * q.x, y += c * q.y;
	      }
	    }
	    quad.x = x / weight;
	    quad.y = y / weight;
	  }

	  // For leaf nodes, accumulate forces from coincident quadrants.
	  else {
	    q = quad;
	    q.x = q.data[0];
	    q.y = q.data[1];
	    do { strength += 30; }
	    while (q = q.next);
	  }

	  quad.value = strength;
	});


	function getTightBoxesBST (node) {
	  //const data = node.data;
	  var xmin = tree._x(node.data);
	  var xmax = xmin;
	  var ymin = tree._y(node.data);
	  var ymax = ymin;

	  var child = node.left;
	  if (child) {
	    xmin = Math.min(xmin, child.x0);
	    ymin = Math.min(ymin, child.y0);
	    xmax = Math.max(xmax, child.x1);
	    ymax = Math.max(ymax, child.y1);
	  }
	  child = node.right;
	  if (child) {
	    xmin = Math.min(xmin, child.x0);
	    ymin = Math.min(ymin, child.y0);
	    xmax = Math.max(xmax, child.x1);
	    ymax = Math.max(ymax, child.y1);
	  }

	  node.x0 = xmin;
	  node.y0 = ymin;
	  node.x1 = xmax;
	  node.y1 = ymax;
	}


	svg.selectAll(".node")
	  .data(nodes(tree))
	  .enter().append("rect")
	    .attr("class", function (d) { return d.scanned ? 'node node--scanned' : 'node'; })
	    .attr("x", function (d)  { return d.x0; })
	    .attr("y", function (d) { return d.y0; })
	    .attr("width", function (d) { return d.x1 - d.x0; })
	    .attr("height", function (d) { return d.y1 - d.y0; });


	var med = svg.selectAll(".med")
	  .data(tree.map(function (n) { return [n.cx, n.cy, n.r, n.scanned, n.focus]; }))
	  .enter().append("circle")
	    .attr("class", function (d) { return d[4] ? 'med med--focus' : "med"; })
	    .attr("cx", function (d) { return d[0]; })
	    .attr("cy", function (d) { return d[1]; })
	    .attr("r",  function (d) { return d[2]; });


	tree.preOrder(function (n) {
	  if (n.focus) {
	    svg.append('circle')
	      .attr('class', 'med--outer')
	      .attr('cx', n.cx)
	      .attr('cy', n.cy)
	      .attr('r', (n.r || 4) / theta);
	    return true;
	  }
	});


	// svg.selectAll(".node")
	//   .data(nodesUB(u))
	//   .enter().append("rect")
	//     .attr("class", d => d.scanned ? 'node node--scanned' : 'node')
	//     .attr("x", d  => d.x0)
	//     .attr("y", d => d.y0)
	//     .attr("width", d => d.x1 - d.x0)
	//     .attr("height", d => d.y1 - d.y0);


	// const med = svg.selectAll(".med")
	//   .data(u.map((n) => [n.cx, n.cy, n.r, n.scanned]))
	//   .enter().append("circle")
	//     .attr("class", "med")
	//     .attr("cx", d => d[0])
	//     .attr("cy", d => d[1])
	//     .attr("r",  d => d[2]);

}());
