(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var benchmark = createCommonjsModule(function (module, exports) {
	(function() {

	  /** Used as a safe reference for `undefined` in pre ES5 environments. */
	  var undefined;

	  /** Used to determine if values are of the language type Object. */
	  var objectTypes = {
	    'function': true,
	    'object': true
	  };

	  /** Used as a reference to the global object. */
	  var root = (objectTypes[typeof window] && window) || this;

	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;

	  /** Detect free variable `module`. */
	  var freeModule = module && !module.nodeType && module;

	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
	  var freeGlobal = freeExports && freeModule && typeof commonjsGlobal == 'object' && commonjsGlobal;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
	    root = freeGlobal;
	  }

	  /** Detect free variable `require`. */
	  var freeRequire = typeof commonjsRequire == 'function' && commonjsRequire;

	  /** Used to assign each benchmark an incremented id. */
	  var counter = 0;

	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	  /** Used to detect primitive types. */
	  var rePrimitive = /^(?:boolean|number|string|undefined)$/;

	  /** Used to make every compiled test unique. */
	  var uidCounter = 0;

	  /** Used to assign default `context` object properties. */
	  var contextProps = [
	    'Array', 'Date', 'Function', 'Math', 'Object', 'RegExp', 'String', '_',
	    'clearTimeout', 'chrome', 'chromium', 'document', 'navigator', 'phantom',
	    'platform', 'process', 'runtime', 'setTimeout'
	  ];

	  /** Used to avoid hz of Infinity. */
	  var divisors = {
	    '1': 4096,
	    '2': 512,
	    '3': 64,
	    '4': 8,
	    '5': 0
	  };

	  /**
	   * T-Distribution two-tailed critical values for 95% confidence.
	   * For more info see http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm.
	   */
	  var tTable = {
	    '1':  12.706, '2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
	    '7':  2.365,  '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
	    '13': 2.16,   '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
	    '19': 2.093,  '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
	    '25': 2.06,   '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
	    'infinity': 1.96
	  };

	  /**
	   * Critical Mann-Whitney U-values for 95% confidence.
	   * For more info see http://www.saburchill.com/IBbiology/stats/003.html.
	   */
	  var uTable = {
	    '5':  [0, 1, 2],
	    '6':  [1, 2, 3, 5],
	    '7':  [1, 3, 5, 6, 8],
	    '8':  [2, 4, 6, 8, 10, 13],
	    '9':  [2, 4, 7, 10, 12, 15, 17],
	    '10': [3, 5, 8, 11, 14, 17, 20, 23],
	    '11': [3, 6, 9, 13, 16, 19, 23, 26, 30],
	    '12': [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
	    '13': [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
	    '14': [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
	    '15': [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
	    '16': [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
	    '17': [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
	    '18': [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
	    '19': [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
	    '20': [8, 14, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 98, 105, 112, 119, 127],
	    '21': [8, 15, 22, 29, 36, 43, 50, 58, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142],
	    '22': [9, 16, 23, 30, 38, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 150, 158],
	    '23': [9, 17, 24, 32, 40, 48, 56, 64, 73, 81, 89, 98, 106, 115, 123, 132, 140, 149, 157, 166, 175],
	    '24': [10, 17, 25, 33, 42, 50, 59, 67, 76, 85, 94, 102, 111, 120, 129, 138, 147, 156, 165, 174, 183, 192],
	    '25': [10, 18, 27, 35, 44, 53, 62, 71, 80, 89, 98, 107, 117, 126, 135, 145, 154, 163, 173, 182, 192, 201, 211],
	    '26': [11, 19, 28, 37, 46, 55, 64, 74, 83, 93, 102, 112, 122, 132, 141, 151, 161, 171, 181, 191, 200, 210, 220, 230],
	    '27': [11, 20, 29, 38, 48, 57, 67, 77, 87, 97, 107, 118, 125, 138, 147, 158, 168, 178, 188, 199, 209, 219, 230, 240, 250],
	    '28': [12, 21, 30, 40, 50, 60, 70, 80, 90, 101, 111, 122, 132, 143, 154, 164, 175, 186, 196, 207, 218, 228, 239, 250, 261, 272],
	    '29': [13, 22, 32, 42, 52, 62, 73, 83, 94, 105, 116, 127, 138, 149, 160, 171, 182, 193, 204, 215, 226, 238, 249, 260, 271, 282, 294],
	    '30': [13, 23, 33, 43, 54, 65, 76, 87, 98, 109, 120, 131, 143, 154, 166, 177, 189, 200, 212, 223, 235, 247, 258, 270, 282, 293, 305, 317]
	  };

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Create a new `Benchmark` function using the given `context` object.
	   *
	   * @static
	   * @memberOf Benchmark
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns a new `Benchmark` function.
	   */
	  function runInContext(context) {
	    // Exit early if unable to acquire lodash.
	    var _ = context && context._ || require('lodash') || root._;
	    if (!_) {
	      Benchmark.runInContext = runInContext;
	      return Benchmark;
	    }
	    // Avoid issues with some ES3 environments that attempt to use values, named
	    // after built-in constructors like `Object`, for the creation of literals.
	    // ES5 clears this up by stating that literals must use built-in constructors.
	    // See http://es5.github.io/#x11.1.5.
	    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

	    /** Native constructor references. */
	    var Array = context.Array,
	        Date = context.Date,
	        Function = context.Function,
	        Math = context.Math,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String;

	    /** Used for `Array` and `Object` method references. */
	    var arrayRef = [],
	        objectProto = Object.prototype;

	    /** Native method shortcuts. */
	    var abs = Math.abs,
	        clearTimeout = context.clearTimeout,
	        floor = Math.floor,
	        log = Math.log,
	        max = Math.max,
	        min = Math.min,
	        pow = Math.pow,
	        push = arrayRef.push,
	        setTimeout = context.setTimeout,
	        shift = arrayRef.shift,
	        slice = arrayRef.slice,
	        sqrt = Math.sqrt,
	        toString = objectProto.toString,
	        unshift = arrayRef.unshift;

	    /** Used to avoid inclusion in Browserified bundles. */
	    var req = require;

	    /** Detect DOM document object. */
	    var doc = isHostType(context, 'document') && context.document;

	    /** Used to access Wade Simmons' Node.js `microtime` module. */
	    var microtimeObject = req('microtime');

	    /** Used to access Node.js's high resolution timer. */
	    var processObject = isHostType(context, 'process') && context.process;

	    /** Used to prevent a `removeChild` memory leak in IE < 9. */
	    var trash = doc && doc.createElement('div');

	    /** Used to integrity check compiled tests. */
	    var uid = 'uid' + _.now();

	    /** Used to avoid infinite recursion when methods call each other. */
	    var calledBy = {};

	    /**
	     * An object used to flag environments/features.
	     *
	     * @static
	     * @memberOf Benchmark
	     * @type Object
	     */
	    var support = {};

	    (function() {

	      /**
	       * Detect if running in a browser environment.
	       *
	       * @memberOf Benchmark.support
	       * @type boolean
	       */
	      support.browser = doc && isHostType(context, 'navigator') && !isHostType(context, 'phantom');

	      /**
	       * Detect if the Timers API exists.
	       *
	       * @memberOf Benchmark.support
	       * @type boolean
	       */
	      support.timeout = isHostType(context, 'setTimeout') && isHostType(context, 'clearTimeout');

	      /**
	       * Detect if function decompilation is support.
	       *
	       * @name decompilation
	       * @memberOf Benchmark.support
	       * @type boolean
	       */
	      try {
	        // Safari 2.x removes commas in object literals from `Function#toString` results.
	        // See http://webk.it/11609 for more details.
	        // Firefox 3.6 and Opera 9.25 strip grouping parentheses from `Function#toString` results.
	        // See http://bugzil.la/559438 for more details.
	        support.decompilation = Function(
	          ('return (' + (function(x) { return { 'x': '' + (1 + x) + '', 'y': 0 }; }) + ')')
	          // Avoid issues with code added by Istanbul.
	          .replace(/__cov__[^;]+;/g, '')
	        )()(0).x === '1';
	      } catch(e) {
	        support.decompilation = false;
	      }
	    }());

	    /**
	     * Timer object used by `clock()` and `Deferred#resolve`.
	     *
	     * @private
	     * @type Object
	     */
	    var timer = {

	      /**
	       * The timer namespace object or constructor.
	       *
	       * @private
	       * @memberOf timer
	       * @type {Function|Object}
	       */
	      'ns': Date,

	      /**
	       * Starts the deferred timer.
	       *
	       * @private
	       * @memberOf timer
	       * @param {Object} deferred The deferred instance.
	       */
	      'start': null, // Lazy defined in `clock()`.

	      /**
	       * Stops the deferred timer.
	       *
	       * @private
	       * @memberOf timer
	       * @param {Object} deferred The deferred instance.
	       */
	      'stop': null // Lazy defined in `clock()`.
	    };

	    /*------------------------------------------------------------------------*/

	    /**
	     * The Benchmark constructor.
	     *
	     * Note: The Benchmark constructor exposes a handful of lodash methods to
	     * make working with arrays, collections, and objects easier. The lodash
	     * methods are:
	     * [`each/forEach`](https://lodash.com/docs#forEach), [`forOwn`](https://lodash.com/docs#forOwn),
	     * [`has`](https://lodash.com/docs#has), [`indexOf`](https://lodash.com/docs#indexOf),
	     * [`map`](https://lodash.com/docs#map), and [`reduce`](https://lodash.com/docs#reduce)
	     *
	     * @constructor
	     * @param {string} name A name to identify the benchmark.
	     * @param {Function|string} fn The test to benchmark.
	     * @param {Object} [options={}] Options object.
	     * @example
	     *
	     * // basic usage (the `new` operator is optional)
	     * var bench = new Benchmark(fn);
	     *
	     * // or using a name first
	     * var bench = new Benchmark('foo', fn);
	     *
	     * // or with options
	     * var bench = new Benchmark('foo', fn, {
	     *
	     *   // displayed by `Benchmark#toString` if `name` is not available
	     *   'id': 'xyz',
	     *
	     *   // called when the benchmark starts running
	     *   'onStart': onStart,
	     *
	     *   // called after each run cycle
	     *   'onCycle': onCycle,
	     *
	     *   // called when aborted
	     *   'onAbort': onAbort,
	     *
	     *   // called when a test errors
	     *   'onError': onError,
	     *
	     *   // called when reset
	     *   'onReset': onReset,
	     *
	     *   // called when the benchmark completes running
	     *   'onComplete': onComplete,
	     *
	     *   // compiled/called before the test loop
	     *   'setup': setup,
	     *
	     *   // compiled/called after the test loop
	     *   'teardown': teardown
	     * });
	     *
	     * // or name and options
	     * var bench = new Benchmark('foo', {
	     *
	     *   // a flag to indicate the benchmark is deferred
	     *   'defer': true,
	     *
	     *   // benchmark test function
	     *   'fn': function(deferred) {
	     *     // call `Deferred#resolve` when the deferred test is finished
	     *     deferred.resolve();
	     *   }
	     * });
	     *
	     * // or options only
	     * var bench = new Benchmark({
	     *
	     *   // benchmark name
	     *   'name': 'foo',
	     *
	     *   // benchmark test as a string
	     *   'fn': '[1,2,3,4].sort()'
	     * });
	     *
	     * // a test's `this` binding is set to the benchmark instance
	     * var bench = new Benchmark('foo', function() {
	     *   'My name is '.concat(this.name); // "My name is foo"
	     * });
	     */
	    function Benchmark(name, fn, options) {
	      var bench = this;

	      // Allow instance creation without the `new` operator.
	      if (!(bench instanceof Benchmark)) {
	        return new Benchmark(name, fn, options);
	      }
	      // Juggle arguments.
	      if (_.isPlainObject(name)) {
	        // 1 argument (options).
	        options = name;
	      }
	      else if (_.isFunction(name)) {
	        // 2 arguments (fn, options).
	        options = fn;
	        fn = name;
	      }
	      else if (_.isPlainObject(fn)) {
	        // 2 arguments (name, options).
	        options = fn;
	        fn = null;
	        bench.name = name;
	      }
	      else {
	        // 3 arguments (name, fn [, options]).
	        bench.name = name;
	      }
	      setOptions(bench, options);

	      bench.id || (bench.id = ++counter);
	      bench.fn == null && (bench.fn = fn);

	      bench.stats = cloneDeep(bench.stats);
	      bench.times = cloneDeep(bench.times);
	    }

	    /**
	     * The Deferred constructor.
	     *
	     * @constructor
	     * @memberOf Benchmark
	     * @param {Object} clone The cloned benchmark instance.
	     */
	    function Deferred(clone) {
	      var deferred = this;
	      if (!(deferred instanceof Deferred)) {
	        return new Deferred(clone);
	      }
	      deferred.benchmark = clone;
	      clock(deferred);
	    }

	    /**
	     * The Event constructor.
	     *
	     * @constructor
	     * @memberOf Benchmark
	     * @param {Object|string} type The event type.
	     */
	    function Event(type) {
	      var event = this;
	      if (type instanceof Event) {
	        return type;
	      }
	      return (event instanceof Event)
	        ? _.assign(event, { 'timeStamp': _.now() }, typeof type == 'string' ? { 'type': type } : type)
	        : new Event(type);
	    }

	    /**
	     * The Suite constructor.
	     *
	     * Note: Each Suite instance has a handful of wrapped lodash methods to
	     * make working with Suites easier. The wrapped lodash methods are:
	     * [`each/forEach`](https://lodash.com/docs#forEach), [`indexOf`](https://lodash.com/docs#indexOf),
	     * [`map`](https://lodash.com/docs#map), and [`reduce`](https://lodash.com/docs#reduce)
	     *
	     * @constructor
	     * @memberOf Benchmark
	     * @param {string} name A name to identify the suite.
	     * @param {Object} [options={}] Options object.
	     * @example
	     *
	     * // basic usage (the `new` operator is optional)
	     * var suite = new Benchmark.Suite;
	     *
	     * // or using a name first
	     * var suite = new Benchmark.Suite('foo');
	     *
	     * // or with options
	     * var suite = new Benchmark.Suite('foo', {
	     *
	     *   // called when the suite starts running
	     *   'onStart': onStart,
	     *
	     *   // called between running benchmarks
	     *   'onCycle': onCycle,
	     *
	     *   // called when aborted
	     *   'onAbort': onAbort,
	     *
	     *   // called when a test errors
	     *   'onError': onError,
	     *
	     *   // called when reset
	     *   'onReset': onReset,
	     *
	     *   // called when the suite completes running
	     *   'onComplete': onComplete
	     * });
	     */
	    function Suite(name, options) {
	      var suite = this;

	      // Allow instance creation without the `new` operator.
	      if (!(suite instanceof Suite)) {
	        return new Suite(name, options);
	      }
	      // Juggle arguments.
	      if (_.isPlainObject(name)) {
	        // 1 argument (options).
	        options = name;
	      } else {
	        // 2 arguments (name [, options]).
	        suite.name = name;
	      }
	      setOptions(suite, options);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * A specialized version of `_.cloneDeep` which only clones arrays and plain
	     * objects assigning all other values by reference.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @returns {*} The cloned value.
	     */
	    var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
	      // Only clone primitives, arrays, and plain objects.
	      if (!_.isArray(value) && !_.isPlainObject(value)) {
	        return value;
	      }
	    });

	    /**
	     * Creates a function from the given arguments string and body.
	     *
	     * @private
	     * @param {string} args The comma separated function arguments.
	     * @param {string} body The function body.
	     * @returns {Function} The new function.
	     */
	    function createFunction() {
	      // Lazy define.
	      createFunction = function(args, body) {
	        var result,
	            anchor = Benchmark,
	            prop = uid + 'createFunction';

	        runScript(('Benchmark.') + prop + '=function(' + args + '){' + body + '}');
	        result = anchor[prop];
	        delete anchor[prop];
	        return result;
	      };
	      // Fix JaegerMonkey bug.
	      // For more information see http://bugzil.la/639720.
	      createFunction = support.browser && (createFunction('', 'return"' + uid + '"') || _.noop)() == uid ? createFunction : Function;
	      return createFunction.apply(null, arguments);
	    }

	    /**
	     * Delay the execution of a function based on the benchmark's `delay` property.
	     *
	     * @private
	     * @param {Object} bench The benchmark instance.
	     * @param {Object} fn The function to execute.
	     */
	    function delay(bench, fn) {
	      bench._timerId = _.delay(fn, bench.delay * 1e3);
	    }

	    /**
	     * Destroys the given element.
	     *
	     * @private
	     * @param {Element} element The element to destroy.
	     */
	    function destroyElement(element) {
	      trash.appendChild(element);
	      trash.innerHTML = '';
	    }

	    /**
	     * Gets the name of the first argument from a function's source.
	     *
	     * @private
	     * @param {Function} fn The function.
	     * @returns {string} The argument name.
	     */
	    function getFirstArgument(fn) {
	      return (!_.has(fn, 'toString') &&
	        (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1]) || '';
	    }

	    /**
	     * Computes the arithmetic mean of a sample.
	     *
	     * @private
	     * @param {Array} sample The sample.
	     * @returns {number} The mean.
	     */
	    function getMean(sample) {
	      return (_.reduce(sample, function(sum, x) {
	        return sum + x;
	      }) / sample.length) || 0;
	    }

	    /**
	     * Gets the source code of a function.
	     *
	     * @private
	     * @param {Function} fn The function.
	     * @returns {string} The function's source code.
	     */
	    function getSource(fn) {
	      var result = '';
	      if (isStringable(fn)) {
	        result = String(fn);
	      } else if (support.decompilation) {
	        // Escape the `{` for Firefox 1.
	        result = _.result(/^[^{]+\{([\s\S]*)\}\s*$/.exec(fn), 1);
	      }
	      // Trim string.
	      result = (result || '').replace(/^\s+|\s+$/g, '');

	      // Detect strings containing only the "use strict" directive.
	      return /^(?:\/\*+[\w\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result)
	        ? ''
	        : result;
	    }

	    /**
	     * Host objects can return type values that are different from their actual
	     * data type. The objects we are concerned with usually return non-primitive
	     * types of "object", "function", or "unknown".
	     *
	     * @private
	     * @param {*} object The owner of the property.
	     * @param {string} property The property to check.
	     * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
	     */
	    function isHostType(object, property) {
	      if (object == null) {
	        return false;
	      }
	      var type = typeof object[property];
	      return !rePrimitive.test(type) && (type != 'object' || !!object[property]);
	    }

	    /**
	     * Checks if a value can be safely coerced to a string.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if the value can be coerced, else `false`.
	     */
	    function isStringable(value) {
	      return _.isString(value) || (_.has(value, 'toString') && _.isFunction(value.toString));
	    }

	    /**
	     * A wrapper around `require` to suppress `module missing` errors.
	     *
	     * @private
	     * @param {string} id The module id.
	     * @returns {*} The exported module or `null`.
	     */
	    function require(id) {
	      try {
	        var result = freeExports && freeRequire(id);
	      } catch(e) {}
	      return result || null;
	    }

	    /**
	     * Runs a snippet of JavaScript via script injection.
	     *
	     * @private
	     * @param {string} code The code to run.
	     */
	    function runScript(code) {
	      var anchor = Benchmark,
	          script = doc.createElement('script'),
	          sibling = doc.getElementsByTagName('script')[0],
	          parent = sibling.parentNode,
	          prop = uid + 'runScript',
	          prefix = '(' + ('Benchmark.') + prop + '||function(){})();';

	      // Firefox 2.0.0.2 cannot use script injection as intended because it executes
	      // asynchronously, but that's OK because script injection is only used to avoid
	      // the previously commented JaegerMonkey bug.
	      try {
	        // Remove the inserted script *before* running the code to avoid differences
	        // in the expected script element count/order of the document.
	        script.appendChild(doc.createTextNode(prefix + code));
	        anchor[prop] = function() { destroyElement(script); };
	      } catch(e) {
	        parent = parent.cloneNode(false);
	        sibling = null;
	        script.text = code;
	      }
	      parent.insertBefore(script, sibling);
	      delete anchor[prop];
	    }

	    /**
	     * A helper function for setting options/event handlers.
	     *
	     * @private
	     * @param {Object} object The benchmark or suite instance.
	     * @param {Object} [options={}] Options object.
	     */
	    function setOptions(object, options) {
	      options = object.options = _.assign({}, cloneDeep(object.constructor.options), cloneDeep(options));

	      _.forOwn(options, function(value, key) {
	        if (value != null) {
	          // Add event listeners.
	          if (/^on[A-Z]/.test(key)) {
	            _.each(key.split(' '), function(key) {
	              object.on(key.slice(2).toLowerCase(), value);
	            });
	          } else if (!_.has(object, key)) {
	            object[key] = cloneDeep(value);
	          }
	        }
	      });
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Handles cycling/completing the deferred benchmark.
	     *
	     * @memberOf Benchmark.Deferred
	     */
	    function resolve() {
	      var deferred = this,
	          clone = deferred.benchmark,
	          bench = clone._original;

	      if (bench.aborted) {
	        // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete.
	        deferred.teardown();
	        clone.running = false;
	        cycle(deferred);
	      }
	      else if (++deferred.cycles < clone.count) {
	        clone.compiled.call(deferred, context, timer);
	      }
	      else {
	        timer.stop(deferred);
	        deferred.teardown();
	        delay(clone, function() { cycle(deferred); });
	      }
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * A generic `Array#filter` like method.
	     *
	     * @static
	     * @memberOf Benchmark
	     * @param {Array} array The array to iterate over.
	     * @param {Function|string} callback The function/alias called per iteration.
	     * @returns {Array} A new array of values that passed callback filter.
	     * @example
	     *
	     * // get odd numbers
	     * Benchmark.filter([1, 2, 3, 4, 5], function(n) {
	     *   return n % 2;
	     * }); // -> [1, 3, 5];
	     *
	     * // get fastest benchmarks
	     * Benchmark.filter(benches, 'fastest');
	     *
	     * // get slowest benchmarks
	     * Benchmark.filter(benches, 'slowest');
	     *
	     * // get benchmarks that completed without erroring
	     * Benchmark.filter(benches, 'successful');
	     */
	    function filter(array, callback) {
	      if (callback === 'successful') {
	        // Callback to exclude those that are errored, unrun, or have hz of Infinity.
	        callback = function(bench) {
	          return bench.cycles && _.isFinite(bench.hz) && !bench.error;
	        };
	      }
	      else if (callback === 'fastest' || callback === 'slowest') {
	        // Get successful, sort by period + margin of error, and filter fastest/slowest.
	        var result = filter(array, 'successful').sort(function(a, b) {
	          a = a.stats; b = b.stats;
	          return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === 'fastest' ? 1 : -1);
	        });

	        return _.filter(result, function(bench) {
	          return result[0].compare(bench) == 0;
	        });
	      }
	      return _.filter(array, callback);
	    }

	    /**
	     * Converts a number to a more readable comma-separated string representation.
	     *
	     * @static
	     * @memberOf Benchmark
	     * @param {number} number The number to convert.
	     * @returns {string} The more readable string representation.
	     */
	    function formatNumber(number) {
	      number = String(number).split('.');
	      return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
	        (number[1] ? '.' + number[1] : '');
	    }

	    /**
	     * Invokes a method on all items in an array.
	     *
	     * @static
	     * @memberOf Benchmark
	     * @param {Array} benches Array of benchmarks to iterate over.
	     * @param {Object|string} name The name of the method to invoke OR options object.
	     * @param {...*} [args] Arguments to invoke the method with.
	     * @returns {Array} A new array of values returned from each method invoked.
	     * @example
	     *
	     * // invoke `reset` on all benchmarks
	     * Benchmark.invoke(benches, 'reset');
	     *
	     * // invoke `emit` with arguments
	     * Benchmark.invoke(benches, 'emit', 'complete', listener);
	     *
	     * // invoke `run(true)`, treat benchmarks as a queue, and register invoke callbacks
	     * Benchmark.invoke(benches, {
	     *
	     *   // invoke the `run` method
	     *   'name': 'run',
	     *
	     *   // pass a single argument
	     *   'args': true,
	     *
	     *   // treat as queue, removing benchmarks from front of `benches` until empty
	     *   'queued': true,
	     *
	     *   // called before any benchmarks have been invoked.
	     *   'onStart': onStart,
	     *
	     *   // called between invoking benchmarks
	     *   'onCycle': onCycle,
	     *
	     *   // called after all benchmarks have been invoked.
	     *   'onComplete': onComplete
	     * });
	     */
	    function invoke(benches, name) {
	      var args,
	          bench,
	          queued,
	          index = -1,
	          eventProps = { 'currentTarget': benches },
	          options = { 'onStart': _.noop, 'onCycle': _.noop, 'onComplete': _.noop },
	          result = _.toArray(benches);

	      /**
	       * Invokes the method of the current object and if synchronous, fetches the next.
	       */
	      function execute() {
	        var listeners,
	            async = isAsync(bench);

	        if (async) {
	          // Use `getNext` as the first listener.
	          bench.on('complete', getNext);
	          listeners = bench.events.complete;
	          listeners.splice(0, 0, listeners.pop());
	        }
	        // Execute method.
	        result[index] = _.isFunction(bench && bench[name]) ? bench[name].apply(bench, args) : undefined;
	        // If synchronous return `true` until finished.
	        return !async && getNext();
	      }

	      /**
	       * Fetches the next bench or executes `onComplete` callback.
	       */
	      function getNext(event) {
	        var cycleEvent,
	            last = bench,
	            async = isAsync(last);

	        if (async) {
	          last.off('complete', getNext);
	          last.emit('complete');
	        }
	        // Emit "cycle" event.
	        eventProps.type = 'cycle';
	        eventProps.target = last;
	        cycleEvent = Event(eventProps);
	        options.onCycle.call(benches, cycleEvent);

	        // Choose next benchmark if not exiting early.
	        if (!cycleEvent.aborted && raiseIndex() !== false) {
	          bench = queued ? benches[0] : result[index];
	          if (isAsync(bench)) {
	            delay(bench, execute);
	          }
	          else if (async) {
	            // Resume execution if previously asynchronous but now synchronous.
	            while (execute()) {}
	          }
	          else {
	            // Continue synchronous execution.
	            return true;
	          }
	        } else {
	          // Emit "complete" event.
	          eventProps.type = 'complete';
	          options.onComplete.call(benches, Event(eventProps));
	        }
	        // When used as a listener `event.aborted = true` will cancel the rest of
	        // the "complete" listeners because they were already called above and when
	        // used as part of `getNext` the `return false` will exit the execution while-loop.
	        if (event) {
	          event.aborted = true;
	        } else {
	          return false;
	        }
	      }

	      /**
	       * Checks if invoking `Benchmark#run` with asynchronous cycles.
	       */
	      function isAsync(object) {
	        // Avoid using `instanceof` here because of IE memory leak issues with host objects.
	        var async = args[0] && args[0].async;
	        return name == 'run' && (object instanceof Benchmark) &&
	          ((async == null ? object.options.async : async) && support.timeout || object.defer);
	      }

	      /**
	       * Raises `index` to the next defined index or returns `false`.
	       */
	      function raiseIndex() {
	        index++;

	        // If queued remove the previous bench.
	        if (queued && index > 0) {
	          shift.call(benches);
	        }
	        // If we reached the last index then return `false`.
	        return (queued ? benches.length : index < result.length)
	          ? index
	          : (index = false);
	      }
	      // Juggle arguments.
	      if (_.isString(name)) {
	        // 2 arguments (array, name).
	        args = slice.call(arguments, 2);
	      } else {
	        // 2 arguments (array, options).
	        options = _.assign(options, name);
	        name = options.name;
	        args = _.isArray(args = 'args' in options ? options.args : []) ? args : [args];
	        queued = options.queued;
	      }
	      // Start iterating over the array.
	      if (raiseIndex() !== false) {
	        // Emit "start" event.
	        bench = result[index];
	        eventProps.type = 'start';
	        eventProps.target = bench;
	        options.onStart.call(benches, Event(eventProps));

	        // End early if the suite was aborted in an "onStart" listener.
	        if (name == 'run' && (benches instanceof Suite) && benches.aborted) {
	          // Emit "cycle" event.
	          eventProps.type = 'cycle';
	          options.onCycle.call(benches, Event(eventProps));
	          // Emit "complete" event.
	          eventProps.type = 'complete';
	          options.onComplete.call(benches, Event(eventProps));
	        }
	        // Start method execution.
	        else {
	          if (isAsync(bench)) {
	            delay(bench, execute);
	          } else {
	            while (execute()) {}
	          }
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates a string of joined array values or object key-value pairs.
	     *
	     * @static
	     * @memberOf Benchmark
	     * @param {Array|Object} object The object to operate on.
	     * @param {string} [separator1=','] The separator used between key-value pairs.
	     * @param {string} [separator2=': '] The separator used between keys and values.
	     * @returns {string} The joined result.
	     */
	    function join(object, separator1, separator2) {
	      var result = [],
	          length = (object = Object(object)).length,
	          arrayLike = length === length >>> 0;

	      separator2 || (separator2 = ': ');
	      _.each(object, function(value, key) {
	        result.push(arrayLike ? value : key + separator2 + value);
	      });
	      return result.join(separator1 || ',');
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Aborts all benchmarks in the suite.
	     *
	     * @name abort
	     * @memberOf Benchmark.Suite
	     * @returns {Object} The suite instance.
	     */
	    function abortSuite() {
	      var event,
	          suite = this,
	          resetting = calledBy.resetSuite;

	      if (suite.running) {
	        event = Event('abort');
	        suite.emit(event);
	        if (!event.cancelled || resetting) {
	          // Avoid infinite recursion.
	          calledBy.abortSuite = true;
	          suite.reset();
	          delete calledBy.abortSuite;

	          if (!resetting) {
	            suite.aborted = true;
	            invoke(suite, 'abort');
	          }
	        }
	      }
	      return suite;
	    }

	    /**
	     * Adds a test to the benchmark suite.
	     *
	     * @memberOf Benchmark.Suite
	     * @param {string} name A name to identify the benchmark.
	     * @param {Function|string} fn The test to benchmark.
	     * @param {Object} [options={}] Options object.
	     * @returns {Object} The suite instance.
	     * @example
	     *
	     * // basic usage
	     * suite.add(fn);
	     *
	     * // or using a name first
	     * suite.add('foo', fn);
	     *
	     * // or with options
	     * suite.add('foo', fn, {
	     *   'onCycle': onCycle,
	     *   'onComplete': onComplete
	     * });
	     *
	     * // or name and options
	     * suite.add('foo', {
	     *   'fn': fn,
	     *   'onCycle': onCycle,
	     *   'onComplete': onComplete
	     * });
	     *
	     * // or options only
	     * suite.add({
	     *   'name': 'foo',
	     *   'fn': fn,
	     *   'onCycle': onCycle,
	     *   'onComplete': onComplete
	     * });
	     */
	    function add(name, fn, options) {
	      var suite = this,
	          bench = new Benchmark(name, fn, options),
	          event = Event({ 'type': 'add', 'target': bench });

	      if (suite.emit(event), !event.cancelled) {
	        suite.push(bench);
	      }
	      return suite;
	    }

	    /**
	     * Creates a new suite with cloned benchmarks.
	     *
	     * @name clone
	     * @memberOf Benchmark.Suite
	     * @param {Object} options Options object to overwrite cloned options.
	     * @returns {Object} The new suite instance.
	     */
	    function cloneSuite(options) {
	      var suite = this,
	          result = new suite.constructor(_.assign({}, suite.options, options));

	      // Copy own properties.
	      _.forOwn(suite, function(value, key) {
	        if (!_.has(result, key)) {
	          result[key] = _.isFunction(_.get(value, 'clone'))
	            ? value.clone()
	            : cloneDeep(value);
	        }
	      });
	      return result;
	    }

	    /**
	     * An `Array#filter` like method.
	     *
	     * @name filter
	     * @memberOf Benchmark.Suite
	     * @param {Function|string} callback The function/alias called per iteration.
	     * @returns {Object} A new suite of benchmarks that passed callback filter.
	     */
	    function filterSuite(callback) {
	      var suite = this,
	          result = new suite.constructor(suite.options);

	      result.push.apply(result, filter(suite, callback));
	      return result;
	    }

	    /**
	     * Resets all benchmarks in the suite.
	     *
	     * @name reset
	     * @memberOf Benchmark.Suite
	     * @returns {Object} The suite instance.
	     */
	    function resetSuite() {
	      var event,
	          suite = this,
	          aborting = calledBy.abortSuite;

	      if (suite.running && !aborting) {
	        // No worries, `resetSuite()` is called within `abortSuite()`.
	        calledBy.resetSuite = true;
	        suite.abort();
	        delete calledBy.resetSuite;
	      }
	      // Reset if the state has changed.
	      else if ((suite.aborted || suite.running) &&
	          (suite.emit(event = Event('reset')), !event.cancelled)) {
	        suite.aborted = suite.running = false;
	        if (!aborting) {
	          invoke(suite, 'reset');
	        }
	      }
	      return suite;
	    }

	    /**
	     * Runs the suite.
	     *
	     * @name run
	     * @memberOf Benchmark.Suite
	     * @param {Object} [options={}] Options object.
	     * @returns {Object} The suite instance.
	     * @example
	     *
	     * // basic usage
	     * suite.run();
	     *
	     * // or with options
	     * suite.run({ 'async': true, 'queued': true });
	     */
	    function runSuite(options) {
	      var suite = this;

	      suite.reset();
	      suite.running = true;
	      options || (options = {});

	      invoke(suite, {
	        'name': 'run',
	        'args': options,
	        'queued': options.queued,
	        'onStart': function(event) {
	          suite.emit(event);
	        },
	        'onCycle': function(event) {
	          var bench = event.target;
	          if (bench.error) {
	            suite.emit({ 'type': 'error', 'target': bench });
	          }
	          suite.emit(event);
	          event.aborted = suite.aborted;
	        },
	        'onComplete': function(event) {
	          suite.running = false;
	          suite.emit(event);
	        }
	      });
	      return suite;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Executes all registered listeners of the specified event type.
	     *
	     * @memberOf Benchmark, Benchmark.Suite
	     * @param {Object|string} type The event type or object.
	     * @param {...*} [args] Arguments to invoke the listener with.
	     * @returns {*} Returns the return value of the last listener executed.
	     */
	    function emit(type) {
	      var listeners,
	          object = this,
	          event = Event(type),
	          events = object.events,
	          args = (arguments[0] = event, arguments);

	      event.currentTarget || (event.currentTarget = object);
	      event.target || (event.target = object);
	      delete event.result;

	      if (events && (listeners = _.has(events, event.type) && events[event.type])) {
	        _.each(listeners.slice(), function(listener) {
	          if ((event.result = listener.apply(object, args)) === false) {
	            event.cancelled = true;
	          }
	          return !event.aborted;
	        });
	      }
	      return event.result;
	    }

	    /**
	     * Returns an array of event listeners for a given type that can be manipulated
	     * to add or remove listeners.
	     *
	     * @memberOf Benchmark, Benchmark.Suite
	     * @param {string} type The event type.
	     * @returns {Array} The listeners array.
	     */
	    function listeners(type) {
	      var object = this,
	          events = object.events || (object.events = {});

	      return _.has(events, type) ? events[type] : (events[type] = []);
	    }

	    /**
	     * Unregisters a listener for the specified event type(s),
	     * or unregisters all listeners for the specified event type(s),
	     * or unregisters all listeners for all event types.
	     *
	     * @memberOf Benchmark, Benchmark.Suite
	     * @param {string} [type] The event type.
	     * @param {Function} [listener] The function to unregister.
	     * @returns {Object} The current instance.
	     * @example
	     *
	     * // unregister a listener for an event type
	     * bench.off('cycle', listener);
	     *
	     * // unregister a listener for multiple event types
	     * bench.off('start cycle', listener);
	     *
	     * // unregister all listeners for an event type
	     * bench.off('cycle');
	     *
	     * // unregister all listeners for multiple event types
	     * bench.off('start cycle complete');
	     *
	     * // unregister all listeners for all event types
	     * bench.off();
	     */
	    function off(type, listener) {
	      var object = this,
	          events = object.events;

	      if (!events) {
	        return object;
	      }
	      _.each(type ? type.split(' ') : events, function(listeners, type) {
	        var index;
	        if (typeof listeners == 'string') {
	          type = listeners;
	          listeners = _.has(events, type) && events[type];
	        }
	        if (listeners) {
	          if (listener) {
	            index = _.indexOf(listeners, listener);
	            if (index > -1) {
	              listeners.splice(index, 1);
	            }
	          } else {
	            listeners.length = 0;
	          }
	        }
	      });
	      return object;
	    }

	    /**
	     * Registers a listener for the specified event type(s).
	     *
	     * @memberOf Benchmark, Benchmark.Suite
	     * @param {string} type The event type.
	     * @param {Function} listener The function to register.
	     * @returns {Object} The current instance.
	     * @example
	     *
	     * // register a listener for an event type
	     * bench.on('cycle', listener);
	     *
	     * // register a listener for multiple event types
	     * bench.on('start cycle', listener);
	     */
	    function on(type, listener) {
	      var object = this,
	          events = object.events || (object.events = {});

	      _.each(type.split(' '), function(type) {
	        (_.has(events, type)
	          ? events[type]
	          : (events[type] = [])
	        ).push(listener);
	      });
	      return object;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Aborts the benchmark without recording times.
	     *
	     * @memberOf Benchmark
	     * @returns {Object} The benchmark instance.
	     */
	    function abort() {
	      var event,
	          bench = this,
	          resetting = calledBy.reset;

	      if (bench.running) {
	        event = Event('abort');
	        bench.emit(event);
	        if (!event.cancelled || resetting) {
	          // Avoid infinite recursion.
	          calledBy.abort = true;
	          bench.reset();
	          delete calledBy.abort;

	          if (support.timeout) {
	            clearTimeout(bench._timerId);
	            delete bench._timerId;
	          }
	          if (!resetting) {
	            bench.aborted = true;
	            bench.running = false;
	          }
	        }
	      }
	      return bench;
	    }

	    /**
	     * Creates a new benchmark using the same test and options.
	     *
	     * @memberOf Benchmark
	     * @param {Object} options Options object to overwrite cloned options.
	     * @returns {Object} The new benchmark instance.
	     * @example
	     *
	     * var bizarro = bench.clone({
	     *   'name': 'doppelganger'
	     * });
	     */
	    function clone(options) {
	      var bench = this,
	          result = new bench.constructor(_.assign({}, bench, options));

	      // Correct the `options` object.
	      result.options = _.assign({}, cloneDeep(bench.options), cloneDeep(options));

	      // Copy own custom properties.
	      _.forOwn(bench, function(value, key) {
	        if (!_.has(result, key)) {
	          result[key] = cloneDeep(value);
	        }
	      });

	      return result;
	    }

	    /**
	     * Determines if a benchmark is faster than another.
	     *
	     * @memberOf Benchmark
	     * @param {Object} other The benchmark to compare.
	     * @returns {number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
	     */
	    function compare(other) {
	      var bench = this;

	      // Exit early if comparing the same benchmark.
	      if (bench == other) {
	        return 0;
	      }
	      var critical,
	          zStat,
	          sample1 = bench.stats.sample,
	          sample2 = other.stats.sample,
	          size1 = sample1.length,
	          size2 = sample2.length,
	          maxSize = max(size1, size2),
	          minSize = min(size1, size2),
	          u1 = getU(sample1, sample2),
	          u2 = getU(sample2, sample1),
	          u = min(u1, u2);

	      function getScore(xA, sampleB) {
	        return _.reduce(sampleB, function(total, xB) {
	          return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
	        }, 0);
	      }

	      function getU(sampleA, sampleB) {
	        return _.reduce(sampleA, function(total, xA) {
	          return total + getScore(xA, sampleB);
	        }, 0);
	      }

	      function getZ(u) {
	        return (u - ((size1 * size2) / 2)) / sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
	      }
	      // Reject the null hypothesis the two samples come from the
	      // same population (i.e. have the same median) if...
	      if (size1 + size2 > 30) {
	        // ...the z-stat is greater than 1.96 or less than -1.96
	        // http://www.statisticslectures.com/topics/mannwhitneyu/
	        zStat = getZ(u);
	        return abs(zStat) > 1.96 ? (u == u1 ? 1 : -1) : 0;
	      }
	      // ...the U value is less than or equal the critical U value.
	      critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
	      return u <= critical ? (u == u1 ? 1 : -1) : 0;
	    }

	    /**
	     * Reset properties and abort if running.
	     *
	     * @memberOf Benchmark
	     * @returns {Object} The benchmark instance.
	     */
	    function reset() {
	      var bench = this;
	      if (bench.running && !calledBy.abort) {
	        // No worries, `reset()` is called within `abort()`.
	        calledBy.reset = true;
	        bench.abort();
	        delete calledBy.reset;
	        return bench;
	      }
	      var event,
	          index = 0,
	          changes = [],
	          queue = [];

	      // A non-recursive solution to check if properties have changed.
	      // For more information see http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4.
	      var data = {
	        'destination': bench,
	        'source': _.assign({}, cloneDeep(bench.constructor.prototype), cloneDeep(bench.options))
	      };

	      do {
	        _.forOwn(data.source, function(value, key) {
	          var changed,
	              destination = data.destination,
	              currValue = destination[key];

	          // Skip pseudo private properties and event listeners.
	          if (/^_|^events$|^on[A-Z]/.test(key)) {
	            return;
	          }
	          if (_.isObjectLike(value)) {
	            if (_.isArray(value)) {
	              // Check if an array value has changed to a non-array value.
	              if (!_.isArray(currValue)) {
	                changed = true;
	                currValue = [];
	              }
	              // Check if an array has changed its length.
	              if (currValue.length != value.length) {
	                changed = true;
	                currValue = currValue.slice(0, value.length);
	                currValue.length = value.length;
	              }
	            }
	            // Check if an object has changed to a non-object value.
	            else if (!_.isObjectLike(currValue)) {
	              changed = true;
	              currValue = {};
	            }
	            // Register a changed object.
	            if (changed) {
	              changes.push({ 'destination': destination, 'key': key, 'value': currValue });
	            }
	            queue.push({ 'destination': currValue, 'source': value });
	          }
	          // Register a changed primitive.
	          else if (!_.eq(currValue, value) && value !== undefined) {
	            changes.push({ 'destination': destination, 'key': key, 'value': value });
	          }
	        });
	      }
	      while ((data = queue[index++]));

	      // If changed emit the `reset` event and if it isn't cancelled reset the benchmark.
	      if (changes.length &&
	          (bench.emit(event = Event('reset')), !event.cancelled)) {
	        _.each(changes, function(data) {
	          data.destination[data.key] = data.value;
	        });
	      }
	      return bench;
	    }

	    /**
	     * Displays relevant benchmark information when coerced to a string.
	     *
	     * @name toString
	     * @memberOf Benchmark
	     * @returns {string} A string representation of the benchmark instance.
	     */
	    function toStringBench() {
	      var bench = this,
	          error = bench.error,
	          hz = bench.hz,
	          id = bench.id,
	          stats = bench.stats,
	          size = stats.sample.length,
	          pm = '\xb1',
	          result = bench.name || (_.isNaN(id) ? id : '<Test #' + id + '>');

	      if (error) {
	        var errorStr;
	        if (!_.isObject(error)) {
	          errorStr = String(error);
	        } else if (!_.isError(Error)) {
	          errorStr = join(error);
	        } else {
	          // Error#name and Error#message properties are non-enumerable.
	          errorStr = join(_.assign({ 'name': error.name, 'message': error.message }, error));
	        }
	        result += ': ' + errorStr;
	      }
	      else {
	        result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
	          stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
	      }
	      return result;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Clocks the time taken to execute a test per cycle (secs).
	     *
	     * @private
	     * @param {Object} bench The benchmark instance.
	     * @returns {number} The time taken.
	     */
	    function clock() {
	      var options = Benchmark.options,
	          templateData = {},
	          timers = [{ 'ns': timer.ns, 'res': max(0.0015, getRes('ms')), 'unit': 'ms' }];

	      // Lazy define for hi-res timers.
	      clock = function(clone) {
	        var deferred;

	        if (clone instanceof Deferred) {
	          deferred = clone;
	          clone = deferred.benchmark;
	        }
	        var bench = clone._original,
	            stringable = isStringable(bench.fn),
	            count = bench.count = clone.count,
	            decompilable = stringable || (support.decompilation && (clone.setup !== _.noop || clone.teardown !== _.noop)),
	            id = bench.id,
	            name = bench.name || (typeof id == 'number' ? '<Test #' + id + '>' : id),
	            result = 0;

	        // Init `minTime` if needed.
	        clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);

	        // Compile in setup/teardown functions and the test loop.
	        // Create a new compiled test, instead of using the cached `bench.compiled`,
	        // to avoid potential engine optimizations enabled over the life of the test.
	        var funcBody = deferred
	          ? 'var d#=this,${fnArg}=d#,m#=d#.benchmark._original,f#=m#.fn,su#=m#.setup,td#=m#.teardown;' +
	            // When `deferred.cycles` is `0` then...
	            'if(!d#.cycles){' +
	            // set `deferred.fn`,
	            'd#.fn=function(){var ${fnArg}=d#;if(typeof f#=="function"){try{${fn}\n}catch(e#){f#(d#)}}else{${fn}\n}};' +
	            // set `deferred.teardown`,
	            'd#.teardown=function(){d#.cycles=0;if(typeof td#=="function"){try{${teardown}\n}catch(e#){td#()}}else{${teardown}\n}};' +
	            // execute the benchmark's `setup`,
	            'if(typeof su#=="function"){try{${setup}\n}catch(e#){su#()}}else{${setup}\n};' +
	            // start timer,
	            't#.start(d#);' +
	            // and then execute `deferred.fn` and return a dummy object.
	            '}d#.fn();return{uid:"${uid}"}'

	          : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count,n#=t#.ns;${setup}\n${begin};' +
	            'while(i#--){${fn}\n}${end};${teardown}\nreturn{elapsed:r#,uid:"${uid}"}';

	        var compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody),
	            isEmpty = !(templateData.fn || stringable);

	        try {
	          if (isEmpty) {
	            // Firefox may remove dead code from `Function#toString` results.
	            // For more information see http://bugzil.la/536085.
	            throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
	          }
	          else if (!deferred) {
	            // Pretest to determine if compiled code exits early, usually by a
	            // rogue `return` statement, by checking for a return object with the uid.
	            bench.count = 1;
	            compiled = decompilable && (compiled.call(bench, context, timer) || {}).uid == templateData.uid && compiled;
	            bench.count = count;
	          }
	        } catch(e) {
	          compiled = null;
	          clone.error = e || new Error(String(e));
	          bench.count = count;
	        }
	        // Fallback when a test exits early or errors during pretest.
	        if (!compiled && !deferred && !isEmpty) {
	          funcBody = (
	            stringable || (decompilable && !clone.error)
	              ? 'function f#(){${fn}\n}var r#,s#,m#=this,i#=m#.count'
	              : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count'
	            ) +
	            ',n#=t#.ns;${setup}\n${begin};m#.f#=f#;while(i#--){m#.f#()}${end};' +
	            'delete m#.f#;${teardown}\nreturn{elapsed:r#}';

	          compiled = createCompiled(bench, decompilable, deferred, funcBody);

	          try {
	            // Pretest one more time to check for errors.
	            bench.count = 1;
	            compiled.call(bench, context, timer);
	            bench.count = count;
	            delete clone.error;
	          }
	          catch(e) {
	            bench.count = count;
	            if (!clone.error) {
	              clone.error = e || new Error(String(e));
	            }
	          }
	        }
	        // If no errors run the full test loop.
	        if (!clone.error) {
	          compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody);
	          result = compiled.call(deferred || bench, context, timer).elapsed;
	        }
	        return result;
	      };

	      /*----------------------------------------------------------------------*/

	      /**
	       * Creates a compiled function from the given function `body`.
	       */
	      function createCompiled(bench, decompilable, deferred, body) {
	        var fn = bench.fn,
	            fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '';

	        templateData.uid = uid + uidCounter++;

	        _.assign(templateData, {
	          'setup': decompilable ? getSource(bench.setup) : interpolate('m#.setup()'),
	          'fn': decompilable ? getSource(fn) : interpolate('m#.fn(' + fnArg + ')'),
	          'fnArg': fnArg,
	          'teardown': decompilable ? getSource(bench.teardown) : interpolate('m#.teardown()')
	        });

	        // Use API of chosen timer.
	        if (timer.unit == 'ns') {
	          _.assign(templateData, {
	            'begin': interpolate('s#=n#()'),
	            'end': interpolate('r#=n#(s#);r#=r#[0]+(r#[1]/1e9)')
	          });
	        }
	        else if (timer.unit == 'us') {
	          if (timer.ns.stop) {
	            _.assign(templateData, {
	              'begin': interpolate('s#=n#.start()'),
	              'end': interpolate('r#=n#.microseconds()/1e6')
	            });
	          } else {
	            _.assign(templateData, {
	              'begin': interpolate('s#=n#()'),
	              'end': interpolate('r#=(n#()-s#)/1e6')
	            });
	          }
	        }
	        else if (timer.ns.now) {
	          _.assign(templateData, {
	            'begin': interpolate('s#=n#.now()'),
	            'end': interpolate('r#=(n#.now()-s#)/1e3')
	          });
	        }
	        else {
	          _.assign(templateData, {
	            'begin': interpolate('s#=new n#().getTime()'),
	            'end': interpolate('r#=(new n#().getTime()-s#)/1e3')
	          });
	        }
	        // Define `timer` methods.
	        timer.start = createFunction(
	          interpolate('o#'),
	          interpolate('var n#=this.ns,${begin};o#.elapsed=0;o#.timeStamp=s#')
	        );

	        timer.stop = createFunction(
	          interpolate('o#'),
	          interpolate('var n#=this.ns,s#=o#.timeStamp,${end};o#.elapsed=r#')
	        );

	        // Create compiled test.
	        return createFunction(
	          interpolate('window,t#'),
	          'var global = window, clearTimeout = global.clearTimeout, setTimeout = global.setTimeout;\n' +
	          interpolate(body)
	        );
	      }

	      /**
	       * Gets the current timer's minimum resolution (secs).
	       */
	      function getRes(unit) {
	        var measured,
	            begin,
	            count = 30,
	            divisor = 1e3,
	            ns = timer.ns,
	            sample = [];

	        // Get average smallest measurable time.
	        while (count--) {
	          if (unit == 'us') {
	            divisor = 1e6;
	            if (ns.stop) {
	              ns.start();
	              while (!(measured = ns.microseconds())) {}
	            } else {
	              begin = ns();
	              while (!(measured = ns() - begin)) {}
	            }
	          }
	          else if (unit == 'ns') {
	            divisor = 1e9;
	            begin = (begin = ns())[0] + (begin[1] / divisor);
	            while (!(measured = ((measured = ns())[0] + (measured[1] / divisor)) - begin)) {}
	            divisor = 1;
	          }
	          else if (ns.now) {
	            begin = ns.now();
	            while (!(measured = ns.now() - begin)) {}
	          }
	          else {
	            begin = new ns().getTime();
	            while (!(measured = new ns().getTime() - begin)) {}
	          }
	          // Check for broken timers.
	          if (measured > 0) {
	            sample.push(measured);
	          } else {
	            sample.push(Infinity);
	            break;
	          }
	        }
	        // Convert to seconds.
	        return getMean(sample) / divisor;
	      }

	      /**
	       * Interpolates a given template string.
	       */
	      function interpolate(string) {
	        // Replaces all occurrences of `#` with a unique number and template tokens with content.
	        return _.template(string.replace(/\#/g, /\d+/.exec(templateData.uid)))(templateData);
	      }

	      /*----------------------------------------------------------------------*/

	      // Detect Chrome's microsecond timer:
	      // enable benchmarking via the --enable-benchmarking command
	      // line switch in at least Chrome 7 to use chrome.Interval
	      try {
	        if ((timer.ns = new (context.chrome || context.chromium).Interval)) {
	          timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
	        }
	      } catch(e) {}

	      // Detect Node.js's nanosecond resolution timer available in Node.js >= 0.8.
	      if (processObject && typeof (timer.ns = processObject.hrtime) == 'function') {
	        timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
	      }
	      // Detect Wade Simmons' Node.js `microtime` module.
	      if (microtimeObject && typeof (timer.ns = microtimeObject.now) == 'function') {
	        timers.push({ 'ns': timer.ns,  'res': getRes('us'), 'unit': 'us' });
	      }
	      // Pick timer with highest resolution.
	      timer = _.minBy(timers, 'res');

	      // Error if there are no working timers.
	      if (timer.res == Infinity) {
	        throw new Error('Benchmark.js was unable to find a working timer.');
	      }
	      // Resolve time span required to achieve a percent uncertainty of at most 1%.
	      // For more information see http://spiff.rit.edu/classes/phys273/uncert/uncert.html.
	      options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
	      return clock.apply(null, arguments);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Computes stats on benchmark results.
	     *
	     * @private
	     * @param {Object} bench The benchmark instance.
	     * @param {Object} options The options object.
	     */
	    function compute(bench, options) {
	      options || (options = {});

	      var async = options.async,
	          elapsed = 0,
	          initCount = bench.initCount,
	          minSamples = bench.minSamples,
	          queue = [],
	          sample = bench.stats.sample;

	      /**
	       * Adds a clone to the queue.
	       */
	      function enqueue() {
	        queue.push(_.assign(bench.clone(), {
	          '_original': bench,
	          'events': {
	            'abort': [update],
	            'cycle': [update],
	            'error': [update],
	            'start': [update]
	          }
	        }));
	      }

	      /**
	       * Updates the clone/original benchmarks to keep their data in sync.
	       */
	      function update(event) {
	        var clone = this,
	            type = event.type;

	        if (bench.running) {
	          if (type == 'start') {
	            // Note: `clone.minTime` prop is inited in `clock()`.
	            clone.count = bench.initCount;
	          }
	          else {
	            if (type == 'error') {
	              bench.error = clone.error;
	            }
	            if (type == 'abort') {
	              bench.abort();
	              bench.emit('cycle');
	            } else {
	              event.currentTarget = event.target = bench;
	              bench.emit(event);
	            }
	          }
	        } else if (bench.aborted) {
	          // Clear abort listeners to avoid triggering bench's abort/cycle again.
	          clone.events.abort.length = 0;
	          clone.abort();
	        }
	      }

	      /**
	       * Determines if more clones should be queued or if cycling should stop.
	       */
	      function evaluate(event) {
	        var critical,
	            df,
	            mean,
	            moe,
	            rme,
	            sd,
	            sem,
	            variance,
	            clone = event.target,
	            done = bench.aborted,
	            now = _.now(),
	            size = sample.push(clone.times.period),
	            maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime,
	            times = bench.times,
	            varOf = function(sum, x) { return sum + pow(x - mean, 2); };

	        // Exit early for aborted or unclockable tests.
	        if (done || clone.hz == Infinity) {
	          maxedOut = !(size = sample.length = queue.length = 0);
	        }

	        if (!done) {
	          // Compute the sample mean (estimate of the population mean).
	          mean = getMean(sample);
	          // Compute the sample variance (estimate of the population variance).
	          variance = _.reduce(sample, varOf, 0) / (size - 1) || 0;
	          // Compute the sample standard deviation (estimate of the population standard deviation).
	          sd = sqrt(variance);
	          // Compute the standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean).
	          sem = sd / sqrt(size);
	          // Compute the degrees of freedom.
	          df = size - 1;
	          // Compute the critical value.
	          critical = tTable[Math.round(df) || 1] || tTable.infinity;
	          // Compute the margin of error.
	          moe = sem * critical;
	          // Compute the relative margin of error.
	          rme = (moe / mean) * 100 || 0;

	          _.assign(bench.stats, {
	            'deviation': sd,
	            'mean': mean,
	            'moe': moe,
	            'rme': rme,
	            'sem': sem,
	            'variance': variance
	          });

	          // Abort the cycle loop when the minimum sample size has been collected
	          // and the elapsed time exceeds the maximum time allowed per benchmark.
	          // We don't count cycle delays toward the max time because delays may be
	          // increased by browsers that clamp timeouts for inactive tabs. For more
	          // information see https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs.
	          if (maxedOut) {
	            // Reset the `initCount` in case the benchmark is rerun.
	            bench.initCount = initCount;
	            bench.running = false;
	            done = true;
	            times.elapsed = (now - times.timeStamp) / 1e3;
	          }
	          if (bench.hz != Infinity) {
	            bench.hz = 1 / mean;
	            times.cycle = mean * bench.count;
	            times.period = mean;
	          }
	        }
	        // If time permits, increase sample size to reduce the margin of error.
	        if (queue.length < 2 && !maxedOut) {
	          enqueue();
	        }
	        // Abort the `invoke` cycle when done.
	        event.aborted = done;
	      }

	      // Init queue and begin.
	      enqueue();
	      invoke(queue, {
	        'name': 'run',
	        'args': { 'async': async },
	        'queued': true,
	        'onCycle': evaluate,
	        'onComplete': function() { bench.emit('complete'); }
	      });
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Cycles a benchmark until a run `count` can be established.
	     *
	     * @private
	     * @param {Object} clone The cloned benchmark instance.
	     * @param {Object} options The options object.
	     */
	    function cycle(clone, options) {
	      options || (options = {});

	      var deferred;
	      if (clone instanceof Deferred) {
	        deferred = clone;
	        clone = clone.benchmark;
	      }
	      var clocked,
	          cycles,
	          divisor,
	          event,
	          minTime,
	          period,
	          async = options.async,
	          bench = clone._original,
	          count = clone.count,
	          times = clone.times;

	      // Continue, if not aborted between cycles.
	      if (clone.running) {
	        // `minTime` is set to `Benchmark.options.minTime` in `clock()`.
	        cycles = ++clone.cycles;
	        clocked = deferred ? deferred.elapsed : clock(clone);
	        minTime = clone.minTime;

	        if (cycles > bench.cycles) {
	          bench.cycles = cycles;
	        }
	        if (clone.error) {
	          event = Event('error');
	          event.message = clone.error;
	          clone.emit(event);
	          if (!event.cancelled) {
	            clone.abort();
	          }
	        }
	      }
	      // Continue, if not errored.
	      if (clone.running) {
	        // Compute the time taken to complete last test cycle.
	        bench.times.cycle = times.cycle = clocked;
	        // Compute the seconds per operation.
	        period = bench.times.period = times.period = clocked / count;
	        // Compute the ops per second.
	        bench.hz = clone.hz = 1 / period;
	        // Avoid working our way up to this next time.
	        bench.initCount = clone.initCount = count;
	        // Do we need to do another cycle?
	        clone.running = clocked < minTime;

	        if (clone.running) {
	          // Tests may clock at `0` when `initCount` is a small number,
	          // to avoid that we set its count to something a bit higher.
	          if (!clocked && (divisor = divisors[clone.cycles]) != null) {
	            count = floor(4e6 / divisor);
	          }
	          // Calculate how many more iterations it will take to achieve the `minTime`.
	          if (count <= clone.count) {
	            count += Math.ceil((minTime - clocked) / period);
	          }
	          clone.running = count != Infinity;
	        }
	      }
	      // Should we exit early?
	      event = Event('cycle');
	      clone.emit(event);
	      if (event.aborted) {
	        clone.abort();
	      }
	      // Figure out what to do next.
	      if (clone.running) {
	        // Start a new cycle.
	        clone.count = count;
	        if (deferred) {
	          clone.compiled.call(deferred, context, timer);
	        } else if (async) {
	          delay(clone, function() { cycle(clone, options); });
	        } else {
	          cycle(clone);
	        }
	      }
	      else {
	        // Fix TraceMonkey bug associated with clock fallbacks.
	        // For more information see http://bugzil.la/509069.
	        if (support.browser) {
	          runScript(uid + '=1;delete ' + uid);
	        }
	        // We're done.
	        clone.emit('complete');
	      }
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Runs the benchmark.
	     *
	     * @memberOf Benchmark
	     * @param {Object} [options={}] Options object.
	     * @returns {Object} The benchmark instance.
	     * @example
	     *
	     * // basic usage
	     * bench.run();
	     *
	     * // or with options
	     * bench.run({ 'async': true });
	     */
	    function run(options) {
	      var bench = this,
	          event = Event('start');

	      // Set `running` to `false` so `reset()` won't call `abort()`.
	      bench.running = false;
	      bench.reset();
	      bench.running = true;

	      bench.count = bench.initCount;
	      bench.times.timeStamp = _.now();
	      bench.emit(event);

	      if (!event.cancelled) {
	        options = { 'async': ((options = options && options.async) == null ? bench.async : options) && support.timeout };

	        // For clones created within `compute()`.
	        if (bench._original) {
	          if (bench.defer) {
	            Deferred(bench);
	          } else {
	            cycle(bench, options);
	          }
	        }
	        // For original benchmarks.
	        else {
	          compute(bench, options);
	        }
	      }
	      return bench;
	    }

	    /*------------------------------------------------------------------------*/

	    // Firefox 1 erroneously defines variable and argument names of functions on
	    // the function itself as non-configurable properties with `undefined` values.
	    // The bugginess continues as the `Benchmark` constructor has an argument
	    // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
	    // making it non-writable in the process, unless it is the first property
	    // assigned by for-in loop of `_.assign()`.
	    _.assign(Benchmark, {

	      /**
	       * The default options copied by benchmark instances.
	       *
	       * @static
	       * @memberOf Benchmark
	       * @type Object
	       */
	      'options': {

	        /**
	         * A flag to indicate that benchmark cycles will execute asynchronously
	         * by default.
	         *
	         * @memberOf Benchmark.options
	         * @type boolean
	         */
	        'async': false,

	        /**
	         * A flag to indicate that the benchmark clock is deferred.
	         *
	         * @memberOf Benchmark.options
	         * @type boolean
	         */
	        'defer': false,

	        /**
	         * The delay between test cycles (secs).
	         * @memberOf Benchmark.options
	         * @type number
	         */
	        'delay': 0.005,

	        /**
	         * Displayed by `Benchmark#toString` when a `name` is not available
	         * (auto-generated if absent).
	         *
	         * @memberOf Benchmark.options
	         * @type string
	         */
	        'id': undefined,

	        /**
	         * The default number of times to execute a test on a benchmark's first cycle.
	         *
	         * @memberOf Benchmark.options
	         * @type number
	         */
	        'initCount': 1,

	        /**
	         * The maximum time a benchmark is allowed to run before finishing (secs).
	         *
	         * Note: Cycle delays aren't counted toward the maximum time.
	         *
	         * @memberOf Benchmark.options
	         * @type number
	         */
	        'maxTime': 5,

	        /**
	         * The minimum sample size required to perform statistical analysis.
	         *
	         * @memberOf Benchmark.options
	         * @type number
	         */
	        'minSamples': 5,

	        /**
	         * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
	         *
	         * @memberOf Benchmark.options
	         * @type number
	         */
	        'minTime': 0,

	        /**
	         * The name of the benchmark.
	         *
	         * @memberOf Benchmark.options
	         * @type string
	         */
	        'name': undefined,

	        /**
	         * An event listener called when the benchmark is aborted.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onAbort': undefined,

	        /**
	         * An event listener called when the benchmark completes running.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onComplete': undefined,

	        /**
	         * An event listener called after each run cycle.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onCycle': undefined,

	        /**
	         * An event listener called when a test errors.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onError': undefined,

	        /**
	         * An event listener called when the benchmark is reset.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onReset': undefined,

	        /**
	         * An event listener called when the benchmark starts running.
	         *
	         * @memberOf Benchmark.options
	         * @type Function
	         */
	        'onStart': undefined
	      },

	      /**
	       * Platform object with properties describing things like browser name,
	       * version, and operating system. See [`platform.js`](https://mths.be/platform).
	       *
	       * @static
	       * @memberOf Benchmark
	       * @type Object
	       */
	      'platform': context.platform || require('platform') || ({
	        'description': context.navigator && context.navigator.userAgent || null,
	        'layout': null,
	        'product': null,
	        'name': null,
	        'manufacturer': null,
	        'os': null,
	        'prerelease': null,
	        'version': null,
	        'toString': function() {
	          return this.description || '';
	        }
	      }),

	      /**
	       * The semantic version number.
	       *
	       * @static
	       * @memberOf Benchmark
	       * @type string
	       */
	      'version': '2.1.4'
	    });

	    _.assign(Benchmark, {
	      'filter': filter,
	      'formatNumber': formatNumber,
	      'invoke': invoke,
	      'join': join,
	      'runInContext': runInContext,
	      'support': support
	    });

	    // Add lodash methods to Benchmark.
	    _.each(['each', 'forEach', 'forOwn', 'has', 'indexOf', 'map', 'reduce'], function(methodName) {
	      Benchmark[methodName] = _[methodName];
	    });

	    /*------------------------------------------------------------------------*/

	    _.assign(Benchmark.prototype, {

	      /**
	       * The number of times a test was executed.
	       *
	       * @memberOf Benchmark
	       * @type number
	       */
	      'count': 0,

	      /**
	       * The number of cycles performed while benchmarking.
	       *
	       * @memberOf Benchmark
	       * @type number
	       */
	      'cycles': 0,

	      /**
	       * The number of executions per second.
	       *
	       * @memberOf Benchmark
	       * @type number
	       */
	      'hz': 0,

	      /**
	       * The compiled test function.
	       *
	       * @memberOf Benchmark
	       * @type {Function|string}
	       */
	      'compiled': undefined,

	      /**
	       * The error object if the test failed.
	       *
	       * @memberOf Benchmark
	       * @type Object
	       */
	      'error': undefined,

	      /**
	       * The test to benchmark.
	       *
	       * @memberOf Benchmark
	       * @type {Function|string}
	       */
	      'fn': undefined,

	      /**
	       * A flag to indicate if the benchmark is aborted.
	       *
	       * @memberOf Benchmark
	       * @type boolean
	       */
	      'aborted': false,

	      /**
	       * A flag to indicate if the benchmark is running.
	       *
	       * @memberOf Benchmark
	       * @type boolean
	       */
	      'running': false,

	      /**
	       * Compiled into the test and executed immediately **before** the test loop.
	       *
	       * @memberOf Benchmark
	       * @type {Function|string}
	       * @example
	       *
	       * // basic usage
	       * var bench = Benchmark({
	       *   'setup': function() {
	       *     var c = this.count,
	       *         element = document.getElementById('container');
	       *     while (c--) {
	       *       element.appendChild(document.createElement('div'));
	       *     }
	       *   },
	       *   'fn': function() {
	       *     element.removeChild(element.lastChild);
	       *   }
	       * });
	       *
	       * // compiles to something like:
	       * var c = this.count,
	       *     element = document.getElementById('container');
	       * while (c--) {
	       *   element.appendChild(document.createElement('div'));
	       * }
	       * var start = new Date;
	       * while (count--) {
	       *   element.removeChild(element.lastChild);
	       * }
	       * var end = new Date - start;
	       *
	       * // or using strings
	       * var bench = Benchmark({
	       *   'setup': '\
	       *     var a = 0;\n\
	       *     (function() {\n\
	       *       (function() {\n\
	       *         (function() {',
	       *   'fn': 'a += 1;',
	       *   'teardown': '\
	       *          }())\n\
	       *        }())\n\
	       *      }())'
	       * });
	       *
	       * // compiles to something like:
	       * var a = 0;
	       * (function() {
	       *   (function() {
	       *     (function() {
	       *       var start = new Date;
	       *       while (count--) {
	       *         a += 1;
	       *       }
	       *       var end = new Date - start;
	       *     }())
	       *   }())
	       * }())
	       */
	      'setup': _.noop,

	      /**
	       * Compiled into the test and executed immediately **after** the test loop.
	       *
	       * @memberOf Benchmark
	       * @type {Function|string}
	       */
	      'teardown': _.noop,

	      /**
	       * An object of stats including mean, margin or error, and standard deviation.
	       *
	       * @memberOf Benchmark
	       * @type Object
	       */
	      'stats': {

	        /**
	         * The margin of error.
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'moe': 0,

	        /**
	         * The relative margin of error (expressed as a percentage of the mean).
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'rme': 0,

	        /**
	         * The standard error of the mean.
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'sem': 0,

	        /**
	         * The sample standard deviation.
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'deviation': 0,

	        /**
	         * The sample arithmetic mean (secs).
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'mean': 0,

	        /**
	         * The array of sampled periods.
	         *
	         * @memberOf Benchmark#stats
	         * @type Array
	         */
	        'sample': [],

	        /**
	         * The sample variance.
	         *
	         * @memberOf Benchmark#stats
	         * @type number
	         */
	        'variance': 0
	      },

	      /**
	       * An object of timing data including cycle, elapsed, period, start, and stop.
	       *
	       * @memberOf Benchmark
	       * @type Object
	       */
	      'times': {

	        /**
	         * The time taken to complete the last cycle (secs).
	         *
	         * @memberOf Benchmark#times
	         * @type number
	         */
	        'cycle': 0,

	        /**
	         * The time taken to complete the benchmark (secs).
	         *
	         * @memberOf Benchmark#times
	         * @type number
	         */
	        'elapsed': 0,

	        /**
	         * The time taken to execute the test once (secs).
	         *
	         * @memberOf Benchmark#times
	         * @type number
	         */
	        'period': 0,

	        /**
	         * A timestamp of when the benchmark started (ms).
	         *
	         * @memberOf Benchmark#times
	         * @type number
	         */
	        'timeStamp': 0
	      }
	    });

	    _.assign(Benchmark.prototype, {
	      'abort': abort,
	      'clone': clone,
	      'compare': compare,
	      'emit': emit,
	      'listeners': listeners,
	      'off': off,
	      'on': on,
	      'reset': reset,
	      'run': run,
	      'toString': toStringBench
	    });

	    /*------------------------------------------------------------------------*/

	    _.assign(Deferred.prototype, {

	      /**
	       * The deferred benchmark instance.
	       *
	       * @memberOf Benchmark.Deferred
	       * @type Object
	       */
	      'benchmark': null,

	      /**
	       * The number of deferred cycles performed while benchmarking.
	       *
	       * @memberOf Benchmark.Deferred
	       * @type number
	       */
	      'cycles': 0,

	      /**
	       * The time taken to complete the deferred benchmark (secs).
	       *
	       * @memberOf Benchmark.Deferred
	       * @type number
	       */
	      'elapsed': 0,

	      /**
	       * A timestamp of when the deferred benchmark started (ms).
	       *
	       * @memberOf Benchmark.Deferred
	       * @type number
	       */
	      'timeStamp': 0
	    });

	    _.assign(Deferred.prototype, {
	      'resolve': resolve
	    });

	    /*------------------------------------------------------------------------*/

	    _.assign(Event.prototype, {

	      /**
	       * A flag to indicate if the emitters listener iteration is aborted.
	       *
	       * @memberOf Benchmark.Event
	       * @type boolean
	       */
	      'aborted': false,

	      /**
	       * A flag to indicate if the default action is cancelled.
	       *
	       * @memberOf Benchmark.Event
	       * @type boolean
	       */
	      'cancelled': false,

	      /**
	       * The object whose listeners are currently being processed.
	       *
	       * @memberOf Benchmark.Event
	       * @type Object
	       */
	      'currentTarget': undefined,

	      /**
	       * The return value of the last executed listener.
	       *
	       * @memberOf Benchmark.Event
	       * @type Mixed
	       */
	      'result': undefined,

	      /**
	       * The object to which the event was originally emitted.
	       *
	       * @memberOf Benchmark.Event
	       * @type Object
	       */
	      'target': undefined,

	      /**
	       * A timestamp of when the event was created (ms).
	       *
	       * @memberOf Benchmark.Event
	       * @type number
	       */
	      'timeStamp': 0,

	      /**
	       * The event type.
	       *
	       * @memberOf Benchmark.Event
	       * @type string
	       */
	      'type': ''
	    });

	    /*------------------------------------------------------------------------*/

	    /**
	     * The default options copied by suite instances.
	     *
	     * @static
	     * @memberOf Benchmark.Suite
	     * @type Object
	     */
	    Suite.options = {

	      /**
	       * The name of the suite.
	       *
	       * @memberOf Benchmark.Suite.options
	       * @type string
	       */
	      'name': undefined
	    };

	    /*------------------------------------------------------------------------*/

	    _.assign(Suite.prototype, {

	      /**
	       * The number of benchmarks in the suite.
	       *
	       * @memberOf Benchmark.Suite
	       * @type number
	       */
	      'length': 0,

	      /**
	       * A flag to indicate if the suite is aborted.
	       *
	       * @memberOf Benchmark.Suite
	       * @type boolean
	       */
	      'aborted': false,

	      /**
	       * A flag to indicate if the suite is running.
	       *
	       * @memberOf Benchmark.Suite
	       * @type boolean
	       */
	      'running': false
	    });

	    _.assign(Suite.prototype, {
	      'abort': abortSuite,
	      'add': add,
	      'clone': cloneSuite,
	      'emit': emit,
	      'filter': filterSuite,
	      'join': arrayRef.join,
	      'listeners': listeners,
	      'off': off,
	      'on': on,
	      'pop': arrayRef.pop,
	      'push': push,
	      'reset': resetSuite,
	      'run': runSuite,
	      'reverse': arrayRef.reverse,
	      'shift': shift,
	      'slice': slice,
	      'sort': arrayRef.sort,
	      'splice': arrayRef.splice,
	      'unshift': unshift
	    });

	    /*------------------------------------------------------------------------*/

	    // Expose Deferred, Event, and Suite.
	    _.assign(Benchmark, {
	      'Deferred': Deferred,
	      'Event': Event,
	      'Suite': Suite
	    });

	    /*------------------------------------------------------------------------*/

	    // Add lodash methods as Suite methods.
	    _.each(['each', 'forEach', 'indexOf', 'map', 'reduce'], function(methodName) {
	      var func = _[methodName];
	      Suite.prototype[methodName] = function() {
	        var args = [this];
	        push.apply(args, arguments);
	        return func.apply(_, args);
	      };
	    });

	    // Avoid array-like object bugs with `Array#shift` and `Array#splice`
	    // in Firefox < 10 and IE < 9.
	    _.each(['pop', 'shift', 'splice'], function(methodName) {
	      var func = arrayRef[methodName];

	      Suite.prototype[methodName] = function() {
	        var value = this,
	            result = func.apply(value, arguments);

	        if (value.length === 0) {
	          delete value[0];
	        }
	        return result;
	      };
	    });

	    // Avoid buggy `Array#unshift` in IE < 8 which doesn't return the new
	    // length of the array.
	    Suite.prototype.unshift = function() {
	      var value = this;
	      unshift.apply(value, arguments);
	      return value.length;
	    };

	    return Benchmark;
	  }

	  /*--------------------------------------------------------------------------*/

	  // Export Benchmark.
	  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
	  {
	    var Benchmark = runInContext();

	    // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
	    if (freeExports && freeModule) {
	      // Export for Node.js.
	      if (moduleExports) {
	        (freeModule.exports = Benchmark).Benchmark = Benchmark;
	      }
	      // Export for CommonJS support.
	      freeExports.Benchmark = Benchmark;
	    }
	    else {
	      // Export to the global object.
	      root.Benchmark = Benchmark;
	    }
	  }
	}.call(commonjsGlobal));
	});

	var options = {
	  onStart: function onStart (event) { console.log(this.name); },
	  onError: function onError (event) { console.log(event.target.error); },
	  onCycle: function onCycle (event) {
	    console.log(' -', String(event.target), ("mean " + ((event.target.stats.mean * 1000).toFixed(3)) + "ms"));
	  },
	  onComplete: function onComplete() {
	    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n');
	  }
	};

	function tree_add(d) {
	  var x = +this._x.call(null, d),
	      y = +this._y.call(null, d);
	  return add(this.cover(x, y), x, y, d);
	}

	function add(tree, x, y, d) {
	  if (isNaN(x) || isNaN(y)) { return tree; } // ignore invalid points

	  var parent,
	      node = tree._root,
	      leaf = {data: d},
	      x0 = tree._x0,
	      y0 = tree._y0,
	      x1 = tree._x1,
	      y1 = tree._y1,
	      xm,
	      ym,
	      xp,
	      yp,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) { return tree._root = leaf, tree; }

	  // Find the existing leaf for the new point, or add it.
	  while (node.length) {
	    if (right = x >= (xm = (x0 + x1) / 2)) { x0 = xm; } else { x1 = xm; }
	    if (bottom = y >= (ym = (y0 + y1) / 2)) { y0 = ym; } else { y1 = ym; }
	    if (parent = node, !(node = node[i = bottom << 1 | right])) { return parent[i] = leaf, tree; }
	  }

	  // Is the new point is exactly coincident with the existing point?
	  xp = +tree._x.call(null, node.data);
	  yp = +tree._y.call(null, node.data);
	  if (x === xp && y === yp) { return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree; }

	  // Otherwise, split the leaf node until the old and new point are separated.
	  do {
	    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
	    if (right = x >= (xm = (x0 + x1) / 2)) { x0 = xm; } else { x1 = xm; }
	    if (bottom = y >= (ym = (y0 + y1) / 2)) { y0 = ym; } else { y1 = ym; }
	  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
	  return parent[j] = node, parent[i] = leaf, tree;
	}

	function addAll(data) {
	  var this$1 = this;

	  var d, i, n = data.length,
	      x,
	      y,
	      xz = new Array(n),
	      yz = new Array(n),
	      x0 = Infinity,
	      y0 = Infinity,
	      x1 = -Infinity,
	      y1 = -Infinity;

	  // Compute the points and their extent.
	  for (i = 0; i < n; ++i) {
	    if (isNaN(x = +this$1._x.call(null, d = data[i])) || isNaN(y = +this$1._y.call(null, d))) { continue; }
	    xz[i] = x;
	    yz[i] = y;
	    if (x < x0) { x0 = x; }
	    if (x > x1) { x1 = x; }
	    if (y < y0) { y0 = y; }
	    if (y > y1) { y1 = y; }
	  }

	  // If there were no (valid) points, inherit the existing extent.
	  if (x1 < x0) { x0 = this._x0, x1 = this._x1; }
	  if (y1 < y0) { y0 = this._y0, y1 = this._y1; }

	  // Expand the tree to cover the new points.
	  this.cover(x0, y0).cover(x1, y1);

	  // Add the new points.
	  for (i = 0; i < n; ++i) {
	    add(this$1, xz[i], yz[i], data[i]);
	  }

	  return this;
	}

	function tree_cover(x, y) {
	  if (isNaN(x = +x) || isNaN(y = +y)) { return this; } // ignore invalid points

	  var x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1;

	  // If the quadtree has no extent, initialize them.
	  // Integer extent are necessary so that if we later double the extent,
	  // the existing quadrant boundaries don’t change due to floating point error!
	  if (isNaN(x0)) {
	    x1 = (x0 = Math.floor(x)) + 1;
	    y1 = (y0 = Math.floor(y)) + 1;
	  }

	  // Otherwise, double repeatedly to cover.
	  else if (x0 > x || x > x1 || y0 > y || y > y1) {
	    var z = x1 - x0,
	        node = this._root,
	        parent,
	        i;

	    switch (i = (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
	      case 0: {
	        do { parent = new Array(4), parent[i] = node, node = parent; }
	        while (z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1);
	        break;
	      }
	      case 1: {
	        do { parent = new Array(4), parent[i] = node, node = parent; }
	        while (z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1);
	        break;
	      }
	      case 2: {
	        do { parent = new Array(4), parent[i] = node, node = parent; }
	        while (z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y);
	        break;
	      }
	      case 3: {
	        do { parent = new Array(4), parent[i] = node, node = parent; }
	        while (z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y);
	        break;
	      }
	    }

	    if (this._root && this._root.length) { this._root = node; }
	  }

	  // If the quadtree covers the point already, just return.
	  else { return this; }

	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  return this;
	}

	function tree_data() {
	  var data = [];
	  this.visit(function(node) {
	    if (!node.length) { do { data.push(node.data); } while (node = node.next) }
	  });
	  return data;
	}

	function tree_extent(_) {
	  return arguments.length
	      ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
	      : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
	}

	function Quad(node, x0, y0, x1, y1) {
	  this.node = node;
	  this.x0 = x0;
	  this.y0 = y0;
	  this.x1 = x1;
	  this.y1 = y1;
	}

	function tree_find(x, y, radius) {
	  var this$1 = this;

	  var data,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1,
	      y1,
	      x2,
	      y2,
	      x3 = this._x1,
	      y3 = this._y1,
	      quads = [],
	      node = this._root,
	      q,
	      i;

	  if (node) { quads.push(new Quad(node, x0, y0, x3, y3)); }
	  if (radius == null) { radius = Infinity; }
	  else {
	    x0 = x - radius, y0 = y - radius;
	    x3 = x + radius, y3 = y + radius;
	    radius *= radius;
	  }

	  while (q = quads.pop()) {

	    // Stop searching if this quadrant can’t contain a closer node.
	    if (!(node = q.node)
	        || (x1 = q.x0) > x3
	        || (y1 = q.y0) > y3
	        || (x2 = q.x1) < x0
	        || (y2 = q.y1) < y0) { continue; }

	    // Bisect the current quadrant.
	    if (node.length) {
	      var xm = (x1 + x2) / 2,
	          ym = (y1 + y2) / 2;

	      quads.push(
	        new Quad(node[3], xm, ym, x2, y2),
	        new Quad(node[2], x1, ym, xm, y2),
	        new Quad(node[1], xm, y1, x2, ym),
	        new Quad(node[0], x1, y1, xm, ym)
	      );

	      // Visit the closest quadrant first.
	      if (i = (y >= ym) << 1 | (x >= xm)) {
	        q = quads[quads.length - 1];
	        quads[quads.length - 1] = quads[quads.length - 1 - i];
	        quads[quads.length - 1 - i] = q;
	      }
	    }

	    // Visit this point. (Visiting coincident points isn’t necessary!)
	    else {
	      var dx = x - +this$1._x.call(null, node.data),
	          dy = y - +this$1._y.call(null, node.data),
	          d2 = dx * dx + dy * dy;
	      if (d2 < radius) {
	        var d = Math.sqrt(radius = d2);
	        x0 = x - d, y0 = y - d;
	        x3 = x + d, y3 = y + d;
	        data = node.data;
	      }
	    }
	  }

	  return data;
	}

	function tree_remove(d) {
	  var this$1 = this;

	  if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) { return this; } // ignore invalid points

	  var parent,
	      node = this._root,
	      retainer,
	      previous,
	      next,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1,
	      x,
	      y,
	      xm,
	      ym,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) { return this; }

	  // Find the leaf node for the point.
	  // While descending, also retain the deepest parent with a non-removed sibling.
	  if (node.length) { while (true) {
	    if (right = x >= (xm = (x0 + x1) / 2)) { x0 = xm; } else { x1 = xm; }
	    if (bottom = y >= (ym = (y0 + y1) / 2)) { y0 = ym; } else { y1 = ym; }
	    if (!(parent = node, node = node[i = bottom << 1 | right])) { return this$1; }
	    if (!node.length) { break; }
	    if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) { retainer = parent, j = i; }
	  } }

	  // Find the point to remove.
	  while (node.data !== d) { if (!(previous = node, node = node.next)) { return this$1; } }
	  if (next = node.next) { delete node.next; }

	  // If there are multiple coincident points, remove just the point.
	  if (previous) { return (next ? previous.next = next : delete previous.next), this; }

	  // If this is the root point, remove it.
	  if (!parent) { return this._root = next, this; }

	  // Remove this leaf.
	  next ? parent[i] = next : delete parent[i];

	  // If the parent now contains exactly one leaf, collapse superfluous parents.
	  if ((node = parent[0] || parent[1] || parent[2] || parent[3])
	      && node === (parent[3] || parent[2] || parent[1] || parent[0])
	      && !node.length) {
	    if (retainer) { retainer[j] = node; }
	    else { this._root = node; }
	  }

	  return this;
	}

	function removeAll(data) {
	  var this$1 = this;

	  for (var i = 0, n = data.length; i < n; ++i) { this$1.remove(data[i]); }
	  return this;
	}

	function tree_root() {
	  return this._root;
	}

	function tree_size() {
	  var size = 0;
	  this.visit(function(node) {
	    if (!node.length) { do { ++size; } while (node = node.next) }
	  });
	  return size;
	}

	function tree_visit(callback) {
	  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
	  if (node) { quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1)); }
	  while (q = quads.pop()) {
	    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
	      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[3]) { quads.push(new Quad(child, xm, ym, x1, y1)); }
	      if (child = node[2]) { quads.push(new Quad(child, x0, ym, xm, y1)); }
	      if (child = node[1]) { quads.push(new Quad(child, xm, y0, x1, ym)); }
	      if (child = node[0]) { quads.push(new Quad(child, x0, y0, xm, ym)); }
	    }
	  }
	  return this;
	}

	function tree_visitAfter(callback) {
	  var quads = [], next = [], q;
	  if (this._root) { quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1)); }
	  while (q = quads.pop()) {
	    var node = q.node;
	    if (node.length) {
	      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[0]) { quads.push(new Quad(child, x0, y0, xm, ym)); }
	      if (child = node[1]) { quads.push(new Quad(child, xm, y0, x1, ym)); }
	      if (child = node[2]) { quads.push(new Quad(child, x0, ym, xm, y1)); }
	      if (child = node[3]) { quads.push(new Quad(child, xm, ym, x1, y1)); }
	    }
	    next.push(q);
	  }
	  while (q = next.pop()) {
	    callback(q.node, q.x0, q.y0, q.x1, q.y1);
	  }
	  return this;
	}

	function defaultX(d) {
	  return d[0];
	}

	function tree_x(_) {
	  return arguments.length ? (this._x = _, this) : this._x;
	}

	function defaultY(d) {
	  return d[1];
	}

	function tree_y(_) {
	  return arguments.length ? (this._y = _, this) : this._y;
	}

	function quadtree(nodes, x, y) {
	  var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
	  return nodes == null ? tree : tree.addAll(nodes);
	}

	function Quadtree(x, y, x0, y0, x1, y1) {
	  this._x = x;
	  this._y = y;
	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  this._root = undefined;
	}

	function leaf_copy(leaf) {
	  var copy = {data: leaf.data}, next = copy;
	  while (leaf = leaf.next) { next = next.next = {data: leaf.data}; }
	  return copy;
	}

	var treeProto = quadtree.prototype = Quadtree.prototype;

	treeProto.copy = function() {
	  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
	      node = this._root,
	      nodes,
	      child;

	  if (!node) { return copy; }

	  if (!node.length) { return copy._root = leaf_copy(node), copy; }

	  nodes = [{source: node, target: copy._root = new Array(4)}];
	  while (node = nodes.pop()) {
	    for (var i = 0; i < 4; ++i) {
	      if (child = node.source[i]) {
	        if (child.length) { nodes.push({source: child, target: node.target[i] = new Array(4)}); }
	        else { node.target[i] = leaf_copy(child); }
	      }
	    }
	  }

	  return copy;
	};

	treeProto.add = tree_add;
	treeProto.addAll = addAll;
	treeProto.cover = tree_cover;
	treeProto.data = tree_data;
	treeProto.extent = tree_extent;
	treeProto.find = tree_find;
	treeProto.remove = tree_remove;
	treeProto.removeAll = removeAll;
	treeProto.root = tree_root;
	treeProto.size = tree_size;
	treeProto.visit = tree_visit;
	treeProto.visitAfter = tree_visitAfter;
	treeProto.x = tree_x;
	treeProto.y = tree_y;

	function sortKD(ids, coords, nodeSize, left, right, depth) {
	    if (right - left <= nodeSize) { return; }

	    var m = Math.floor((left + right) / 2);

	    select(ids, coords, m, left, right, depth % 2);

	    sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
	    sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
	}

	function select(ids, coords, k, left, right, inc) {

	    while (right > left) {
	        if (right - left > 600) {
	            var n = right - left + 1;
	            var m = k - left + 1;
	            var z = Math.log(n);
	            var s = 0.5 * Math.exp(2 * z / 3);
	            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
	            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
	            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
	            select(ids, coords, k, newLeft, newRight, inc);
	        }

	        var t = coords[2 * k + inc];
	        var i = left;
	        var j = right;

	        swapItem(ids, coords, left, k);
	        if (coords[2 * right + inc] > t) { swapItem(ids, coords, left, right); }

	        while (i < j) {
	            swapItem(ids, coords, i, j);
	            i++;
	            j--;
	            while (coords[2 * i + inc] < t) { i++; }
	            while (coords[2 * j + inc] > t) { j--; }
	        }

	        if (coords[2 * left + inc] === t) { swapItem(ids, coords, left, j); }
	        else {
	            j++;
	            swapItem(ids, coords, j, right);
	        }

	        if (j <= k) { left = j + 1; }
	        if (k <= j) { right = j - 1; }
	    }
	}

	function swapItem(ids, coords, i, j) {
	    swap(ids, i, j);
	    swap(coords, 2 * i, 2 * j);
	    swap(coords, 2 * i + 1, 2 * j + 1);
	}

	function swap(arr, i, j) {
	    var tmp = arr[i];
	    arr[i] = arr[j];
	    arr[j] = tmp;
	}

	function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
	    var stack = [0, ids.length - 1, 0];
	    var result = [];
	    var x, y;

	    while (stack.length) {
	        var axis = stack.pop();
	        var right = stack.pop();
	        var left = stack.pop();

	        if (right - left <= nodeSize) {
	            for (var i = left; i <= right; i++) {
	                x = coords[2 * i];
	                y = coords[2 * i + 1];
	                if (x >= minX && x <= maxX && y >= minY && y <= maxY) { result.push(ids[i]); }
	            }
	            continue;
	        }

	        var m = Math.floor((left + right) / 2);

	        x = coords[2 * m];
	        y = coords[2 * m + 1];

	        if (x >= minX && x <= maxX && y >= minY && y <= maxY) { result.push(ids[m]); }

	        var nextAxis = (axis + 1) % 2;

	        if (axis === 0 ? minX <= x : minY <= y) {
	            stack.push(left);
	            stack.push(m - 1);
	            stack.push(nextAxis);
	        }
	        if (axis === 0 ? maxX >= x : maxY >= y) {
	            stack.push(m + 1);
	            stack.push(right);
	            stack.push(nextAxis);
	        }
	    }

	    return result;
	}

	function within(ids, coords, qx, qy, r, nodeSize) {
	    var stack = [0, ids.length - 1, 0];
	    var result = [];
	    var r2 = r * r;

	    while (stack.length) {
	        var axis = stack.pop();
	        var right = stack.pop();
	        var left = stack.pop();

	        if (right - left <= nodeSize) {
	            for (var i = left; i <= right; i++) {
	                if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) { result.push(ids[i]); }
	            }
	            continue;
	        }

	        var m = Math.floor((left + right) / 2);

	        var x = coords[2 * m];
	        var y = coords[2 * m + 1];

	        if (sqDist(x, y, qx, qy) <= r2) { result.push(ids[m]); }

	        var nextAxis = (axis + 1) % 2;

	        if (axis === 0 ? qx - r <= x : qy - r <= y) {
	            stack.push(left);
	            stack.push(m - 1);
	            stack.push(nextAxis);
	        }
	        if (axis === 0 ? qx + r >= x : qy + r >= y) {
	            stack.push(m + 1);
	            stack.push(right);
	            stack.push(nextAxis);
	        }
	    }

	    return result;
	}

	function sqDist(ax, ay, bx, by) {
	    var dx = ax - bx;
	    var dy = ay - by;
	    return dx * dx + dy * dy;
	}

	function kdbush(points, getX, getY, nodeSize, ArrayType) {
	    return new KDBush(points, getX, getY, nodeSize, ArrayType);
	}

	function KDBush(points, getX, getY, nodeSize, ArrayType) {
	    var this$1 = this;

	    getX = getX || defaultGetX;
	    getY = getY || defaultGetY;
	    ArrayType = ArrayType || Array;

	    this.nodeSize = nodeSize || 64;
	    this.points = points;

	    this.ids = new ArrayType(points.length);
	    this.coords = new ArrayType(points.length * 2);

	    for (var i = 0; i < points.length; i++) {
	        this$1.ids[i] = i;
	        this$1.coords[2 * i] = getX(points[i]);
	        this$1.coords[2 * i + 1] = getY(points[i]);
	    }

	    sortKD(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
	}

	KDBush.prototype = {
	    range: function (minX, minY, maxX, maxY) {
	        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
	    },

	    within: function (x, y, r) {
	        return within(this.ids, this.coords, x, y, r, this.nodeSize);
	    }
	};

	function defaultGetX(p) { return p[0]; }
	function defaultGetY(p) { return p[1]; }

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

	var defaultX$1 = function (d) { return d.x; };
	var defaultY$1 = function (d) { return d.y; };


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
	var SFCTree = function SFCTree (points, ref) {
	  var getX = ref.getX; if ( getX === void 0 ) getX = defaultX$1;
	  var getY = ref.getY; if ( getY === void 0 ) getY = defaultY$1;
	  var bucketSize = ref.bucketSize; if ( bucketSize === void 0 ) bucketSize = 0;

	  var n     = points.length;
	  var hvalues = new Array(n);
	  var order = new Array(n);

	  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

	  for (var i = 0; i < n; i++) {
	    var p = points[i];
	    var x = getX(p), y = getY(p);
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

	  this._x = getX;
	  this._y = getY;
	  this._bucketSize = bucketSize;

	  this._root = build(points, order, hvalues, 0, n - 1);
	};

	SFCTree.prototype.query = function query () { return [] };


	SFCTree.prototype.inOrder   = inOrder;
	SFCTree.prototype.preOrder  = preOrder;
	SFCTree.prototype.postOrder = postOrder;
	SFCTree.prototype.map       = map;
	SFCTree.prototype.height    = height;
	SFCTree.prototype.size      = size;
	SFCTree.prototype.toString  = toString;

	var Node = function Node(id) {
	  this.id = id;
	  this.count = 0;
	  this.topLeft = this.topRight = this.bottomLeft = this.bottomRight = null;
	};

	var maxx = (1 << 30);
	var maxy = (1 << 30);

	function insert(node, ax, ay, bx, by, x, y, id) {
	  if (ax > x || x > bx || ay > y || y > by) { return node; }
	  if (node === null) { node = new Node(id); }
	  node.count++;
	  if (ax === bx && ay === by) { return node; }

	  var mx = (ax + bx) >> 1;
	  var my = (ay + by) >> 1;

	  node.bottomLeft  = insert(node.bottomLeft, ax, ay, mx, my, x, y, id);
	  node.topLeft     = insert(node.topLeft, ax, my + 1, mx, by, x, y, id);
	  node.bottomRight = insert(node.bottomRight, mx + 1, ay, bx, my, x, y, id);
	  node.topRight    = insert(node.topRight, mx + 1, my + 1, bx, by, x, y, id);

	  return node;
	}

	var QuadTree = function QuadTree(points) {
	  var this$1 = this;

	  this.root = null;
	  for (var i = 0; i < points.length; i++) {
	    var ref = points[i];
	    var x = ref.x;
	    var y = ref.y;
	    this$1.root = insert(this$1.root, 0, 0, maxx - 1, maxy - 1, x, y, i);
	  }
	};

	function build$1 (points, getX, getY) {
	  if ( getX === void 0 ) getX = function (p) { return p.x; };
	  if ( getY === void 0 ) getY = function (p) { return p.y; };

	  var NODE = 0,
	        CENTER_X = 1,
	        CENTER_Y = 2,
	        SIZE = 3,
	        NEXT_SIBLING = 4,
	        FIRST_CHILD = 5,
	        MASS = 6,
	        MASS_CENTER_X = 7,
	        MASS_CENTER_Y = 8;

	  var SUBDIVISION_ATTEMPTS = 3, PPR = 9;
	  var Q = [];
	  // Setting up
	  var minX = Infinity,
	      maxX = -Infinity,
	      minY = Infinity,
	      maxY = -Infinity,
	      q, w, g, q2, subdivisionAttempts;

	  var N = points.length;

	  var X = points.map(getX);
	  var Y = points.map(getY);

	  // Computing min and max values
	  for (var i = 0; i < N; i++) {
	    var x = X[i], y = Y[i];
	    minX = Math.min(minX, x);
	    maxX = Math.max(maxX, x);
	    minY = Math.min(minY, y);
	    maxY = Math.max(maxY, y);
	  }

	  // squarify bounds, it's a quadtree
	  var dx = maxX - minX, dy = maxY - minY;
	  if (dx > dy) {
	    minY -= (dx - dy) / 2;
	    maxY = minY + dx;
	  } else {
	    minX -= (dy - dx) / 2;
	    maxX = minX + dy;
	  }

	    // Build the Barnes Hut root region
	  Q[0 + NODE] = -1;
	  Q[0 + CENTER_X] = (minX + maxX) / 2;
	  Q[0 + CENTER_Y] = (minY + maxY) / 2;
	  Q[0 + SIZE] = Math.max(maxX - minX, maxY - minY);
	  Q[0 + NEXT_SIBLING] = -1;
	  Q[0 + FIRST_CHILD] = -1;
	  Q[0 + MASS] = 0;
	  Q[0 + MASS_CENTER_X] = 0;
	  Q[0 + MASS_CENTER_Y] = 0;

	  // Add each node in the tree
	  var l = 1;
	  for (var n = 0; n < N; n++) {

	    // Current region, starting with root
	    var r = 0;
	    subdivisionAttempts = SUBDIVISION_ATTEMPTS;

	    while (true) {
	      // Are there sub-regions?

	      // We look at first child index
	      if (Q[r + FIRST_CHILD] >= 0) {
	        // There are sub-regions

	        // We just iterate to find a "leaf" of the tree
	        // that is an empty region or a region with a single node
	        // (see next case)

	        // Find the quadrant of n
	        if (X[n] < Q[r + CENTER_X]) {
	          if (Y[n] < Q[r + CENTER_Y]) {
	            // Top Left quarter
	            q = Q[r + FIRST_CHILD];
	          } else {
	              // Bottom Left quarter
	            q = Q[r + FIRST_CHILD] + PPR;
	          }
	        } else {
	          if (Y[n] < Q[r + CENTER_Y]) {
	              // Top Right quarter
	            q = Q[r + FIRST_CHILD] + PPR * 2;
	          } else {
	            // Bottom Right quarter
	            q = Q[r + FIRST_CHILD] + PPR * 3;
	          }
	        }

	        // Update center of mass and mass (we only do it for non-leave regions)
	        // Q[r + MASS_CENTER_X] =
	        //   (Q[r + MASS_CENTER_X] * Q[r + MASS] +
	        //    NodeMatrix[n + NODE_X] * NodeMatrix[n + NODE_MASS]) /
	        //   (Q[r + MASS] + NodeMatrix[n + NODE_MASS]);

	        // Q[r + MASS_CENTER_Y] =
	        //   (Q[r + MASS_CENTER_Y] * Q[r + MASS] +
	        //    NodeMatrix[n + NODE_Y] * NodeMatrix[n + NODE_MASS]) /
	        //   (Q[r + MASS] + NodeMatrix[n + NODE_MASS]);

	        // Q[r + MASS] += NodeMatrix[n + NODE_MASS];

	        // Iterate on the right quadrant
	        r = q;
	        continue;
	      } else {
	        // There are no sub-regions: we are in a "leaf"
	        //
	        // Is there a node in this leave?
	        if (Q[r + NODE] < 0) {
	          // There is no node in region:
	          // we record node n and go on
	          Q[r + NODE] = n;
	          break;
	        } else {
	          // There is a node in this region

	          // We will need to create sub-regions, stick the two
	          // nodes (the old one r[0] and the new one n) in two
	          // subregions. If they fall in the same quadrant,
	          // we will iterate.

	          // Create sub-regions
	          Q[r + FIRST_CHILD] = l * PPR;
	          w = Q[r + SIZE] / 2; // new size (half)

	          // NOTE: we use screen coordinates
	          // from Top Left to Bottom Right

	          // Top Left sub-region
	          g = Q[r + FIRST_CHILD];

	          Q[g + NODE] = -1;
	          Q[g + CENTER_X] = Q[r + CENTER_X] - w;
	          Q[g + CENTER_Y] = Q[r + CENTER_Y] - w;
	          Q[g + SIZE] = w;
	          Q[g + NEXT_SIBLING] = g + PPR;
	          Q[g + FIRST_CHILD] = -1;
	          Q[g + MASS] = 0;
	          Q[g + MASS_CENTER_X] = 0;
	          Q[g + MASS_CENTER_Y] = 0;

	          // Bottom Left sub-region
	          g += PPR;
	          Q[g + NODE] = -1;
	          Q[g + CENTER_X] = Q[r + CENTER_X] - w;
	          Q[g + CENTER_Y] = Q[r + CENTER_Y] + w;
	          Q[g + SIZE] = w;
	          Q[g + NEXT_SIBLING] = g + PPR;
	          Q[g + FIRST_CHILD] = -1;
	          Q[g + MASS] = 0;
	          Q[g + MASS_CENTER_X] = 0;
	          Q[g + MASS_CENTER_Y] = 0;

	          // Top Right sub-region
	          g += PPR;
	          Q[g + NODE] = -1;
	          Q[g + CENTER_X] = Q[r + CENTER_X] + w;
	          Q[g + CENTER_Y] = Q[r + CENTER_Y] - w;
	          Q[g + SIZE] = w;
	          Q[g + NEXT_SIBLING] = g + PPR;
	          Q[g + FIRST_CHILD] = -1;
	          Q[g + MASS] = 0;
	          Q[g + MASS_CENTER_X] = 0;
	          Q[g + MASS_CENTER_Y] = 0;

	          // Bottom Right sub-region
	          g += PPR;
	          Q[g + NODE] = -1;
	          Q[g + CENTER_X] = Q[r + CENTER_X] + w;
	          Q[g + CENTER_Y] = Q[r + CENTER_Y] + w;
	          Q[g + SIZE] = w;
	          Q[g + NEXT_SIBLING] = Q[r + NEXT_SIBLING];
	          Q[g + FIRST_CHILD] = -1;
	          Q[g + MASS] = 0;
	          Q[g + MASS_CENTER_X] = 0;
	          Q[g + MASS_CENTER_Y] = 0;

	          l += 4;

	          // Now the goal is to find two different sub-regions
	          // for the two nodes: the one previously recorded (r[0])
	          // and the one we want to add (n)

	          // Find the quadrant of the old node
	          if (X[Q[r + NODE]] < Q[r + CENTER_X]) {
	            if (Y[Q[r + NODE]] < Q[r + CENTER_Y]) {
	              // Top Left quarter
	              q = Q[r + FIRST_CHILD];
	            } else {
	                // Bottom Left quarter
	              q = Q[r + FIRST_CHILD] + PPR;
	            }
	          } else {
	            if (Y[Q[r + NODE]] < Q[r + CENTER_Y]) {
	              // Top Right quarter
	              q = Q[r + FIRST_CHILD] + PPR * 2;
	            } else {
	              // Bottom Right quarter
	              q = Q[r + FIRST_CHILD] + PPR * 3;
	            }
	          }

	          // We remove r[0] from the region r, add its mass to r and record it in q
	          // Q[r + MASS] = NodeMatrix[Q[r + NODE] + NODE_MASS];
	          // Q[r + MASS_CENTER_X] = NodeMatrix[Q[r + NODE] + NODE_X];
	          // Q[r + MASS_CENTER_Y] = NodeMatrix[Q[r + NODE] + NODE_Y];

	          Q[q + NODE] = Q[r + NODE];
	          Q[r + NODE] = -1;

	          // Find the quadrant of n
	          if (X[n] < Q[r + CENTER_X]) {
	            if (Y[n] < Q[r + CENTER_Y]) {
	              // Top Left quarter
	              q2 = Q[r + FIRST_CHILD];
	            } else {
	              // Bottom Left quarter
	              q2 = Q[r + FIRST_CHILD] + PPR;
	            }
	          } else {
	            if (Y[n] < Q[r + CENTER_Y]) {
	              // Top Right quarter
	              q2 = Q[r + FIRST_CHILD] + PPR * 2;
	            } else {
	              // Bottom Right quarter
	              q2 = Q[r + FIRST_CHILD] + PPR * 3;
	            }
	          }

	          if (q === q2) {
	            // If both nodes are in the same quadrant,
	            // we have to try it again on this quadrant
	            if (subdivisionAttempts--) {
	              r = q;
	              continue; // while
	            } else {
	              // we are out of precision here, and we cannot subdivide anymore
	              // but we have to break the loop anyway
	              subdivisionAttempts = SUBDIVISION_ATTEMPTS;
	              break; // while
	            }
	          }

	          // If both quadrants are different, we record n
	          // in its quadrant
	          Q[q2 + NODE] = n;
	          break;
	        }
	      }
	    }
	  }
	  return Q;
	}

	var skd = function skd(points) {
	  var n = points.length;
	  this.ids = new Array(n);
	  this.tx= new Array(n);
	  this.ty= new Array(n);

	  for (var i = 0; i < n; i++) { points[i].id = i; }

	  build$2(0, n, true, points, this.tx, this.ty, this.ids);
	};

	function build$2(low, high, dim, points, tx, ty, ids) {
	  if (low >= high) { return; }
	  var mid = (low + high) >>> 1;
	  nth_element(points, low, high, mid, dim);

	  var p = points[mid];
	  tx[mid]  = p.x;
	  ty[mid]  = p.y;
	  ids[mid] = p.id;

	  build$2(low,      mid, !dim, points, tx, ty, ids);
	  build$2(mid + 1, high, !dim, points, tx, ty, ids);
	}

	// See: http://www.cplusplus.com/reference/algorithm/nth_element
	function nth_element (a, low, high, n, divX) {
	  while (true) {
	    var k = partition(a, low, high, divX);
	    if (n < k) { high = k; }
	    else if (n > k) { low = k + 1; }
	    else { break; }
	  }
	}

	function partition (a, low, high, divX) {
	  swap$1(a, low + (Math.random() * (high - low))|0, high - 1);
	  var v = divX ? a[high - 1].x : a[high - 1].y;
	  var i = low - 1;
	  for (var j = low; j < high; j++) {
	    var p = a[j];
	    if (divX ? p.x <= v : p.y <= v) { swap$1(a, ++i, j); }
	  }
	  return i;
	}

	function swap$1 (a, i, j) {
	  var t = a[i];
	  a[i] = a[j];
	  a[j] = t;
	}

	/** Implements point kd-tree index structure, as described in Bentley's
	 * 1975 paper "Multidimensional binary search trees used for associative
	 * searching". */

	var Node$1 = function Node (data) {
	  this.data= data;
	  this.left= null;
	  this.right = null;
	};

	var D = 2;

	var KDTree = function KDTree (data, getX, getY) {
	  var this$1 = this;
	  if ( getX === void 0 ) getX = function (d) { return d.x; };
	  if ( getY === void 0 ) getY = function (d) { return d.y; };

	  this._x = getX;
	  this._y = getY;

	  this._root = null;

	  for (var i = 0; i < data.length; i++) {
	    this$1.insert(data[i]);
	  }
	};

	/** Given the current dimension used to cut the data space, return
	 * the next dimension that should be used. */
	KDTree.prototype.nextdimension = function nextdimension (dim) {
	  return (dim + 1) % D;
	};

	    
	KDTree.prototype.insert = function insert (p) {
	    var this$1 = this;

	  var previous = null; // previous node traversed
	  // Set to true if 'current' is left child of 'previous'
	  var leftOfPrevious = false;
	  var current = this._root;
	  var dim = 0, getter = this._x;

	  while (true) {
	    if (current === null) {
	      current = new Node$1(p);
	      // Assign parent's correct child pointer to new node
	      if (previous) {
	        if (leftOfPrevious) { previous.left = current; }
	        else              { previous.right = current; }
	      } else { // if no parent, then ROOT NODE WAS INSERTED. Update root!
	        this$1._root = current;
	      }
	      return true;
	    } else if (getter(p) < getter(current.data)) {
	      previous = current;
	      current= current.left;
	      leftOfPrevious = true;
	    } else if (p === current.data) { // Duplicate point, it already exists! Cannot insert point
	      return false;
	    } else {
	      previous = current;
	      current = current.right;
	      leftOfPrevious = false;
	    }
	    dim = (dim + 1) % D;
	    getter = dim ? this$1._y : this$1._x;
	  }
	};

	    
	KDTree.prototype.query = function query (p) {
	  var current = this._root;
	  var dim = 0;
	  while (current) {// until end of tree is reached
	    if (p === current.data) { return current; }
	    else if (p[dim] < current.data[dim]) { current = current.left; }
	    else                                { current = current.right; }
	    dim = (dim + 1) % D;
	  }
	  return null;
	};

	  
	KDTree.prototype.remove = function remove (p) {
	  this._root = this.recursiveRemove(this._root, p, 0);
	  return this;
	};


	KDTree.prototype.recursiveRemove = function recursiveRemove (node, p, dim) {
	  if (node === null) { return null; }
	  else if (p[dim] < node.data[dim]) {
	    node.left = this.recursiveRemove(node.left, p, (dim + 1) % D);
	  } else if (p[dim] > node.data[dim]) {
	    node.right = this.recursiveRemove(node.right, p, (dim + 1) % D);
	  } else { // found node that stores given point
	    // If node with point is leaf node, simply delete it!
	    if (node.left === null && node.right === null) {
	      return null; // to remove reference to node in parent
	    } else {
	      // Find minimum point for cutting dimension and REPLACE node's point with it
	      if (node.right) {
	        node.data = this.findMinimum(node.right, dim, (dim + 1) % D);
	        node.right = this.recursiveRemove(node.right, node.data, (dim + 1) % D);
	      } else { // if there is no right child!!
	        node.data = this.findMinimum(node.left, dim, (dim + 1) % D);
	        node.left = this.recursiveRemove(node.left, node.data, (dim + 1) % D);
	        // Swap left child with right child
	        node.right = node.left;
	        node.left = null;
	      }
	    }
	  }
	  // If this point is reached, node should not be removed so we
	  // just return the node
	  return node;
	};

	    
	KDTree.prototype.findMinimum = function findMinimum (node, cdim, dim) {
	  // Reached leaf node
	  if (node === null) { return null; }
	    
	  // If cutting cdim is dimension we're looking for minimum in,
	  // just search left child!
	  else if (cdim === dim) {
	    if (node.left === null) { return node.data; }
	    else { return this.findMinimum(node.left, cdim, (dim + 1) % D); }
	  } else { // Otherwise, we have to search BOTH children
	    var a = this.findMinimum(node.left, cdim, (dim + 1) % D);
	    var b = this.findMinimum(node.right, cdim, (dim + 1) % D);
	    if (a && b) { // if minimums were returned from both children
	      var minVal = Math.min(node.data[cdim], Math.min(a[cdim], b[cdim]));
	      if (minVal === node.data[cdim]) { return node.data; }
	      else if (minVal === a[cdim])  { return a; }
	      else                               { return b; }
	    } else if (a) { // if minimum was just returned from left child
	      var minVal$1 = Math.min(node.data[cdim], a[cdim]);
	      if (minVal$1 === node.data[cdim]) { return node.data; }
	      else                               { return a; }
	    } else if (b) { // if minimum was just returned from right child
	      var minVal$2 = Math.min(node.data[cdim], b[cdim]);
	      if (minVal$2 === node.data[cdim]) { return node.data; }
	      else                               { return b; }
	    } else { return node.data; }
	  }
	};

	var Node$2 = function Node () {

	};

	var KDTree$1 = function KDTree (data, getX, getY) {
	  if ( getX === void 0 ) getX = function (d) { return d.x; };
	  if ( getY === void 0 ) getY = function (d) { return d.y; };

	  this._root = null;

	  this._x = getX;
	  this._y = getY;

	  var indexes = new Array(data.length);
	  for (var i = 0; i < data.length; i++) { indexes[i] = i; }

	  this._root = buildNode(0, data.length, data, indexes, getX, getY);
	};


	KDTree$1.prototype.insert = function insert (x, y, data) {

	};


	function buildNode(begin, end, keys, indexes, getX, getY) {
	  var d = keys[0].length;
	  var node = new Node$2();

	  // Fill in basic info
	  node.count = end - begin;
	  node.index = begin;

	  // Calculate the bounding box
	  var minX = Infinity, minY = Infinity;
	  var maxX = -Infinity, maxY = -Infinity;

	  for (var i = begin; i < end; i++) {
	    var d$1 = keys[indexes[i]];
	    var x = getX(d$1), y = getY(d$1);

	    if (x < minX) { minX = x; }
	    if (y < minY) { minY = y; }
	    if (x > maxX) { maxX = x; }
	    if (y > maxY) { maxY = y; }
	  }
	  
	  // Calculate bounding box stats
	  var maxRadius = -1;
	  var rx = maxX - minX, ry = maxY - minY;
	  var getter;

	  if (rx > ry) {
	    maxRadius = rx;
	    node.split = 0;
	    node.cutoff = (maxX + minX) / 2;
	    getter = getX;
	  } else {
	    maxRadius = ry;
	    node.split = 1;
	    node.cutoff = (maxY + minY) / 2;
	    getter = getY;
	  }
	        // If the max spread is 0, make this a leaf node
	  if (maxRadius === 0) {
	    node.lower = node.upper = null;
	    return node;
	  }

	  // Partition the dataset around the midpoint in this dimension. The
	  // partitioning is done in-place by iterating from left-to-right and
	  // right-to-left in the same way that partioning is done in quicksort.
	  var i1 = begin, i2 = end - 1, size = 0;
	  while (i1 <= i2) {
	    var i1Good = getter(keys[indexes[i1]]) < node.cutoff;
	    var i2Good = getter(keys[indexes[i2]]) >= node.cutoff;

	    if (!i1Good && !i2Good) {
	      var temp = indexes[i1];
	      indexes[i1] = indexes[i2];
	      indexes[i2] = temp;
	      i1Good = i2Good = true;
	    }

	    if (i1Good) {
	      i1++;
	      size++;
	    }

	    if (i2Good) { i2--; }
	  }

	  // Create the child nodes
	  node.lower = buildNode(begin, begin + size, keys, indexes, getX, getY);
	  node.upper = buildNode(begin + size, end, keys, indexes, getX, getY);

	  return node;
	}

	var phtree_umd = createCommonjsModule(function (module, exports) {
	/**
	 * phtree v1.0.0
	 * Fast static point hierarchy for particle simulations
	 *
	 * @author Alexander Milevski <info@w8r.name>
	 * @license MIT
	 * @preserve
	 */

	(function (global, factory) {
		module.exports = factory();
	}(commonjsGlobal, (function () {
		function createCommonjsModule$$1(fn, module) {
			return module = { exports: {} }, fn(module, module.exports), module.exports;
		}

		var morton_1 = createCommonjsModule$$1(function (module) {
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
		  if ( printNode === void 0 ) { printNode = function (n) { return n.code; }; }

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


		var Node = function Node () {
		  this.code = 0;
		  //this.parent = parent;
		  this.left = null;
		  this.right= null;
		  this.data = null;
		};


		function buildIterative (data, ids, codes, start, end) {
		  var root    = new Node();
		  var stack = [root, start, end];

		  while (stack.length !== 0) {
		    var last  = stack.pop();
		    var first = stack.pop();
		    var node  = stack.pop();

		    if (last - first === 0) {
		      node.code = codes[first];
		      node.data = data[ids[first]];
		    } else {
		      var split = findSplit(codes, first, last);
		      //const split = (first + last) >> 1;
		      node.code = split;

		      if (first <= split) {
		        node.left = new Node();
		        stack.push(node.left);
		        stack.push(first, split);
		      }

		      if (last > split) {
		        node.right = new Node();
		        stack.push(node.right);
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
		var PHTree = function PHTree (points, ref) {
		  if ( ref === void 0 ) { ref = {}; }
		  var getX = ref.getX; if ( getX === void 0 ) { getX = defaultX; }
		  var getY = ref.getY; if ( getY === void 0 ) { getY = defaultY; }
		  var bucketSize = ref.bucketSize; if ( bucketSize === void 0 ) { bucketSize = 0; }
		  var sfc = ref.sfc; if ( sfc === void 0 ) { sfc = HILBERT; }
		  var recursive = ref.recursive; if ( recursive === void 0 ) { recursive = true; }

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

		return PHTree;

	})));
	//# sourceMappingURL=phtree.umd.js.map
	});

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

	var defaultX$3 = function (d) { return d.x; };
	var defaultY$3 = function (d) { return d.y; };

	var NSIZE = 3;
	function build$4 (data, ids, codes, first, last, storage, id) {
	  if (last - first === 0) {
	    //console.log(id, ids[first]);
	    storage[id * NSIZE]     = id;
	    storage[id * NSIZE + NSIZE - 1] = ids[first];
	    return;
	    //return new Leaf(codes[first], data[ids[first]]);
	  }
	  var split = findSplit(codes, first, last);
	  //const split = (last + first) >> 1;
	  var left  = build$4(data, ids, codes, first,     split, storage, id * 2 + 1);
	  var right = build$4(data, ids, codes, split + 1, last,  storage, id * 2 + 2);

	  storage[id * NSIZE] = id;
	  // storage[id * 4 + 1] = id * 2 + 1;
	  // storage[id * 4 + 2] = id * 2 + 2;
	  // const nd = [left, right];
	  // nd.left = left; nd.right = right;
	  // return nd;
	  return;
	  //return new InternalNode(split, left, right);
	}

	function build$4 (data, ids, codes, start, end, storage, id) {
	  var stack = [id, start, end];

	  while (stack.length !== 0) {
	    var last  = stack.pop();
	    var first = stack.pop();
	    var node  = stack.pop();
	    storage[node * NSIZE] = node;

	    if (last - first === 0) {
	      storage[node * NSIZE] = node;
	      storage[node * NSIZE + NSIZE - 1] = ids[first];
	      // node.code = codes[first];
	      // node.data = data[ids[first]];
	    } else {
	      var split = findSplit(codes, first, last);
	      //const split = (first + last) >> 1;
	      //node.code = split;

	      if (first <= split) {
	        stack.push(node * 2 + 1);
	        stack.push(first, split);
	      }

	      if (last > split) {
	        stack.push(node * 2 + 2);
	        stack.push(split + 1, last);
	      }
	    }
	  }
	}

	/**
	 * This is a very interesting decomposition:
	 * It splits by equal spans on the space-filling curve.
	 * It's super-fast, but the zones are of irregular shapes (tetris-like).
	 * It gets worse if you use morton curve.
	 */
	var ArrayTree = function ArrayTree (points, ref) {
	  var getX = ref.getX; if ( getX === void 0 ) getX = defaultX$3;
	  var getY = ref.getY; if ( getY === void 0 ) getY = defaultY$3;
	  var bucketSize = ref.bucketSize; if ( bucketSize === void 0 ) bucketSize = 0;

	  var n     = points.length;
	  var hvalues = new Array(n);
	  var order = new Array(n);
	  var storage = new Int32Array(Math.pow(2, Math.ceil(Math.log2(n) + 1)) * NSIZE);
	  var indexes = new Int32Array();

	  storage.fill(-1);

	  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

	  for (var i = 0; i < n; i++) {
	    var p = points[i];
	    var x = getX(p), y = getY(p);
	    hvalues[i] = hilbert(x, y);
	    if (x < minX) { minX = x; }
	    if (y < minY) { minY = y; }
	    if (x > maxX) { maxX = x; }
	    if (y > maxY) { maxY = y; }
	    order[i]= i;
	    indexes[i] = i;
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

	  this._root = build$4(points, order, hvalues, 0, n - 1, storage, 0);
	  this._storage = storage;
	};

	ArrayTree.prototype.query = function query () { return [] };

	ArrayTree.prototype.inOrder = function inOrder$$1 (fn, ctx) {
	  var current = 0;
	  var Q = [];
	  var done = false;

	  while (!done) {
	    if (current !== -1) {
	      Q.push(current);
	      current = current * 2 + 1;
	    } else {
	      if (Q.length !== 0) {
	        current = Q.pop();
	        if (fn.call(ctx, storage[current * NSIZE + NSIZE - 1])) { break; }
	        current = current * 2 + 2;
	      } else { done = true; }
	    }
	  }
	  return this;
	};


	ArrayTree.prototype.preOrder = function preOrder$$1 (fn, ctx) {
	  var Q = [0];
	  while (Q.length !== 0){
	    var node = Q.pop();
	    if (!fn.call(ctx, node)) {
	      if (node.right) { Q.push(node.right); }
	      if (node.left){ Q.push(node.left); }
	    }
	  }
	  return this;
	};


	ArrayTree.prototype.postOrder = function postOrder$$1 (fn, ctx) {
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
	};


	ArrayTree.prototype.map = function map$$1 (fn, ctx) {
	  var res = [];
	  this.inOrder(function (node) {
	    res.push(fn.call(ctx, node));
	  });
	  return res;
	};


	ArrayTree.prototype.inOrder   = inOrder;
	// ArrayTree.prototype.preOrder  = preOrder;
	// ArrayTree.prototype.postOrder = postOrder;
	// ArrayTree.prototype.map       = map;
	ArrayTree.prototype.height    = height;
	ArrayTree.prototype.size      = size;
	ArrayTree.prototype.toString  = toString;

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

	var Node$4 = function Node (key, data) {
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
	  var N = new Node$4();
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
	function insert$1 (i, data, t, comparator, tree) {
	  var node = new Node$4(i, data);

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
	function add$1 (i, data, t, comparator, tree) {
	  var node = new Node$4(i, data);

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
	  return this._root = insert$1(key, data, this._root, this._comparator, this);
	};


	/**
	 * Adds a key, if it is not present in the tree
	 * @param{Key}  key
	 * @param{Value=} data
	 * @return {Node|null}
	 */
	Tree.prototype.add = function add$1 (key, data) {
	  return this._root = add$1(key, data, this._root, this._comparator, this);
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
	    right = insert$1(newKey, newData, right, comparator, this);
	  } else {
	    left = insert$1(newKey, newData, left, comparator, this);
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

	var defaultGetX$1 = function (d) { return d.x; };
	var defaultGetY$1 = function (d) { return d.y; };

	var HILBERT$1 = 1;


	var UBTree = function UBTree (data, getX, getY, sfc) {
			var this$1 = this;
			if ( getX === void 0 ) getX = defaultGetX$1;
			if ( getY === void 0 ) getY = defaultGetY$1;
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

	var seedrandom$1 = seedrandom;

	var ngraph_random = {
	  random: random,
	  randomIterator: randomIterator
	};

	/**
	 * Creates seeded PRNG with two methods:
	 *   next() and nextDouble()
	 */
	function random(inputSeed) {
	  var seed = typeof inputSeed === 'number' ? inputSeed : (+ new Date());
	  var randomFunc = function() {
	      // Robert Jenkins' 32 bit integer hash function.
	      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
	      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
	      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
	      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
	      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
	      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
	      return (seed & 0xfffffff) / 0x10000000;
	  };

	  return {
	      /**
	       * Generates random integer number in the range from 0 (inclusive) to maxValue (exclusive)
	       *
	       * @param maxValue Number REQUIRED. Ommitting this number will result in NaN values from PRNG.
	       */
	      next : function (maxValue) {
	          return Math.floor(randomFunc() * maxValue);
	      },

	      /**
	       * Generates random double number in the range from 0 (inclusive) to 1 (exclusive)
	       * This function is the same as Math.random() (except that it could be seeded)
	       */
	      nextDouble : function () {
	          return randomFunc();
	      }
	  };
	}

	/*
	 * Creates iterator over array, which returns items of array in random order
	 * Time complexity is guaranteed to be O(n);
	 */
	function randomIterator(array, customRandom) {
	    var localRandom = customRandom || random();
	    if (typeof localRandom.next !== 'function') {
	      throw new Error('customRandom does not match expected API: next() function is missing');
	    }

	    return {
	        forEach : function (callback) {
	            var i, j, t;
	            for (i = array.length - 1; i > 0; --i) {
	                j = localRandom.next(i + 1); // i inclusive
	                t = array[j];
	                array[j] = array[i];
	                array[i] = t;

	                callback(t);
	            }

	            if (array.length) {
	                callback(array[0]);
	            }
	        },

	        /**
	         * Shuffles array randomly, in place.
	         */
	        shuffle : function () {
	            var i, j, t;
	            for (i = array.length - 1; i > 0; --i) {
	                j = localRandom.next(i + 1); // i inclusive
	                t = array[j];
	                array[j] = array[i];
	                array[i] = t;
	            }

	            return array;
	        }
	    };
	}

	/**
	 * Internal data structure to represent 2D QuadTree node
	 */
	var node = function Node() {
	  // body stored inside this node. In quad tree only leaf nodes (by construction)
	  // contain boides:
	  this.body = null;

	  // Child nodes are stored in quads. Each quad is presented by number:
	  // 0 | 1
	  // -----
	  // 2 | 3
	  this.quad0 = null;
	  this.quad1 = null;
	  this.quad2 = null;
	  this.quad3 = null;

	  // Total mass of current node
	  this.mass = 0;

	  // Center of mass coordinates
	  this.massX = 0;
	  this.massY = 0;

	  // bounding box coordinates
	  this.left = 0;
	  this.top = 0;
	  this.bottom = 0;
	  this.right = 0;
	};

	var insertStack = InsertStack;

	/**
	 * Our implmentation of QuadTree is non-recursive to avoid GC hit
	 * This data structure represent stack of elements
	 * which we are trying to insert into quad tree.
	 */
	function InsertStack () {
	    this.stack = [];
	    this.popIdx = 0;
	}

	InsertStack.prototype = {
	    isEmpty: function() {
	        return this.popIdx === 0;
	    },
	    push: function (node, body) {
	        var item = this.stack[this.popIdx];
	        if (!item) {
	            // we are trying to avoid memory pressue: create new element
	            // only when absolutely necessary
	            this.stack[this.popIdx] = new InsertStackElement(node, body);
	        } else {
	            item.node = node;
	            item.body = body;
	        }
	        ++this.popIdx;
	    },
	    pop: function () {
	        if (this.popIdx > 0) {
	            return this.stack[--this.popIdx];
	        }
	    },
	    reset: function () {
	        this.popIdx = 0;
	    }
	};

	function InsertStackElement(node, body) {
	    this.node = node; // QuadTree node
	    this.body = body; // physical body which needs to be inserted to node
	}

	var isSamePosition = function isSamePosition(point1, point2) {
	    var dx = Math.abs(point1.x - point2.x);
	    var dy = Math.abs(point1.y - point2.y);

	    return (dx < 1e-8 && dy < 1e-8);
	};

	/**
	 * This is Barnes Hut simulation algorithm for 2d case. Implementation
	 * is highly optimized (avoids recusion and gc pressure)
	 *
	 * http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/barnes-hut.html
	 */

	var ngraph_quadtreebh = function(options) {
	  options = options || {};
	  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
	  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

	  // we require deterministic randomness here
	  var random = ngraph_random.random(1984),
	    Node = node,
	    InsertStack = insertStack,
	    isSamePosition$$1 = isSamePosition;

	  var gravity = options.gravity,
	    updateQueue = [],
	    insertStack$$1 = new InsertStack(),
	    theta = options.theta,

	    nodesCache = [],
	    currentInCache = 0,
	    root = newNode();

	  return {
	    insertBodies: insertBodies,
	    /**
	     * Gets root node if its present
	     */
	    getRoot: function() {
	      return root;
	    },
	    updateBodyForce: update,
	    options: function(newOptions) {
	      if (newOptions) {
	        if (typeof newOptions.gravity === 'number') {
	          gravity = newOptions.gravity;
	        }
	        if (typeof newOptions.theta === 'number') {
	          theta = newOptions.theta;
	        }

	        return this;
	      }

	      return {
	        gravity: gravity,
	        theta: theta
	      };
	    }
	  };

	  function newNode() {
	    // To avoid pressure on GC we reuse nodes.
	    var node$$1 = nodesCache[currentInCache];
	    if (node$$1) {
	      node$$1.quad0 = null;
	      node$$1.quad1 = null;
	      node$$1.quad2 = null;
	      node$$1.quad3 = null;
	      node$$1.body = null;
	      node$$1.mass = node$$1.massX = node$$1.massY = 0;
	      node$$1.left = node$$1.right = node$$1.top = node$$1.bottom = 0;
	    } else {
	      node$$1 = new Node();
	      nodesCache[currentInCache] = node$$1;
	    }

	    ++currentInCache;
	    return node$$1;
	  }

	  function update(sourceBody) {
	    var queue = updateQueue,
	      v,
	      dx,
	      dy,
	      r, fx = 0,
	      fy = 0,
	      queueLength = 1,
	      shiftIdx = 0,
	      pushIdx = 1;

	    queue[0] = root;

	    while (queueLength) {
	      var node$$1 = queue[shiftIdx],
	        body = node$$1.body;

	      queueLength -= 1;
	      shiftIdx += 1;
	      var differentBody = (body !== sourceBody);
	      if (body && differentBody) {
	        // If the current node is a leaf node (and it is not source body),
	        // calculate the force exerted by the current node on body, and add this
	        // amount to body's net force.
	        dx = body.pos.x - sourceBody.pos.x;
	        dy = body.pos.y - sourceBody.pos.y;
	        r = Math.sqrt(dx * dx + dy * dy);

	        if (r === 0) {
	          // Poor man's protection against zero distance.
	          dx = (random.nextDouble() - 0.5) / 50;
	          dy = (random.nextDouble() - 0.5) / 50;
	          r = Math.sqrt(dx * dx + dy * dy);
	        }

	        // This is standard gravition force calculation but we divide
	        // by r^3 to save two operations when normalizing force vector.
	        v = gravity * body.mass * sourceBody.mass / (r * r * r);
	        fx += v * dx;
	        fy += v * dy;
	      } else if (differentBody) {
	        // Otherwise, calculate the ratio s / r,  where s is the width of the region
	        // represented by the internal node, and r is the distance between the body
	        // and the node's center-of-mass
	        dx = node$$1.massX / node$$1.mass - sourceBody.pos.x;
	        dy = node$$1.massY / node$$1.mass - sourceBody.pos.y;
	        r = Math.sqrt(dx * dx + dy * dy);

	        if (r === 0) {
	          // Sorry about code duplucation. I don't want to create many functions
	          // right away. Just want to see performance first.
	          dx = (random.nextDouble() - 0.5) / 50;
	          dy = (random.nextDouble() - 0.5) / 50;
	          r = Math.sqrt(dx * dx + dy * dy);
	        }
	        // If s / r < θ, treat this internal node as a single body, and calculate the
	        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
	        if ((node$$1.right - node$$1.left) / r < theta) {
	          // in the if statement above we consider node's width only
	          // because the region was squarified during tree creation.
	          // Thus there is no difference between using width or height.
	          v = gravity * node$$1.mass * sourceBody.mass / (r * r * r);
	          fx += v * dx;
	          fy += v * dy;
	        } else {
	          // Otherwise, run the procedure recursively on each of the current node's children.

	          // I intentionally unfolded this loop, to save several CPU cycles.
	          if (node$$1.quad0) {
	            queue[pushIdx] = node$$1.quad0;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node$$1.quad1) {
	            queue[pushIdx] = node$$1.quad1;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node$$1.quad2) {
	            queue[pushIdx] = node$$1.quad2;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node$$1.quad3) {
	            queue[pushIdx] = node$$1.quad3;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	        }
	      }
	    }

	    sourceBody.force.x += fx;
	    sourceBody.force.y += fy;
	  }

	  function insertBodies(bodies) {
	    var x1 = Number.MAX_VALUE,
	      y1 = Number.MAX_VALUE,
	      x2 = Number.MIN_VALUE,
	      y2 = Number.MIN_VALUE,
	      i,
	      max = bodies.length;

	    // To reduce quad tree depth we are looking for exact bounding box of all particles.
	    i = max;
	    while (i--) {
	      var x = bodies[i].pos.x;
	      var y = bodies[i].pos.y;
	      if (x < x1) {
	        x1 = x;
	      }
	      if (x > x2) {
	        x2 = x;
	      }
	      if (y < y1) {
	        y1 = y;
	      }
	      if (y > y2) {
	        y2 = y;
	      }
	    }

	    // Squarify the bounds.
	    var dx = x2 - x1,
	      dy = y2 - y1;
	    if (dx > dy) {
	      y2 = y1 + dx;
	    } else {
	      x2 = x1 + dy;
	    }

	    currentInCache = 0;
	    root = newNode();
	    root.left = x1;
	    root.right = x2;
	    root.top = y1;
	    root.bottom = y2;

	    i = max - 1;
	    if (i >= 0) {
	      root.body = bodies[i];
	    }
	    while (i--) {
	      insert(bodies[i], root);
	    }
	  }

	  function insert(newBody) {
	    insertStack$$1.reset();
	    insertStack$$1.push(root, newBody);

	    while (!insertStack$$1.isEmpty()) {
	      var stackItem = insertStack$$1.pop(),
	        node$$1 = stackItem.node,
	        body = stackItem.body;

	      if (!node$$1.body) {
	        // This is internal node. Update the total mass of the node and center-of-mass.
	        var x = body.pos.x;
	        var y = body.pos.y;
	        node$$1.mass = node$$1.mass + body.mass;
	        node$$1.massX = node$$1.massX + body.mass * x;
	        node$$1.massY = node$$1.massY + body.mass * y;

	        // Recursively insert the body in the appropriate quadrant.
	        // But first find the appropriate quadrant.
	        var quadIdx = 0, // Assume we are in the 0's quad.
	          left = node$$1.left,
	          right = (node$$1.right + left) / 2,
	          top = node$$1.top,
	          bottom = (node$$1.bottom + top) / 2;

	        if (x > right) { // somewhere in the eastern part.
	          quadIdx = quadIdx + 1;
	          left = right;
	          right = node$$1.right;
	        }
	        if (y > bottom) { // and in south.
	          quadIdx = quadIdx + 2;
	          top = bottom;
	          bottom = node$$1.bottom;
	        }

	        var child = getChild(node$$1, quadIdx);
	        if (!child) {
	          // The node is internal but this quadrant is not taken. Add
	          // subnode to it.
	          child = newNode();
	          child.left = left;
	          child.top = top;
	          child.right = right;
	          child.bottom = bottom;
	          child.body = body;

	          setChild(node$$1, quadIdx, child);
	        } else {
	          // continue searching in this quadrant.
	          insertStack$$1.push(child, body);
	        }
	      } else {
	        // We are trying to add to the leaf node.
	        // We have to convert current leaf into internal node
	        // and continue adding two nodes.
	        var oldBody = node$$1.body;
	        node$$1.body = null; // internal nodes do not cary bodies

	        if (isSamePosition$$1(oldBody.pos, body.pos)) {
	          // Prevent infinite subdivision by bumping one node
	          // anywhere in this quadrant
	          var retriesCount = 3;
	          do {
	            var offset = random.nextDouble();
	            var dx = (node$$1.right - node$$1.left) * offset;
	            var dy = (node$$1.bottom - node$$1.top) * offset;

	            oldBody.pos.x = node$$1.left + dx;
	            oldBody.pos.y = node$$1.top + dy;
	            retriesCount -= 1;
	            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
	          } while (retriesCount > 0 && isSamePosition$$1(oldBody.pos, body.pos));

	          if (retriesCount === 0 && isSamePosition$$1(oldBody.pos, body.pos)) {
	            // This is very bad, we ran out of precision.
	            // if we do not return from the method we'll get into
	            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
	            // Next layout iteration should get larger bounding box in the first step and fix this
	            return;
	          }
	        }
	        // Next iteration should subdivide node further.
	        insertStack$$1.push(node$$1, oldBody);
	        insertStack$$1.push(node$$1, body);
	      }
	    }
	  }
	};

	function getChild(node$$1, idx) {
	  if (idx === 0) { return node$$1.quad0; }
	  if (idx === 1) { return node$$1.quad1; }
	  if (idx === 2) { return node$$1.quad2; }
	  if (idx === 3) { return node$$1.quad3; }
	  return null;
	}

	function setChild(node$$1, idx, child) {
	  if (idx === 0) { node$$1.quad0 = child; }
	  else if (idx === 1) { node$$1.quad1 = child; }
	  else if (idx === 2) { node$$1.quad2 = child; }
	  else if (idx === 3) { node$$1.quad3 = child; }
	}

	var rnd = seedrandom$1('bench');

	var N = 100000;
	var points = new Array(N).fill(0).map(function (_, i) {
	  if (i < N / 2) {
	    return { x: rnd() * N / 100, y: rnd() * N / 100 };
	  } else {
	    return { x: rnd() * N, y: rnd() * N };
	  }
	});

	console.log(benchmark.runInContext({}));

	var pointsbh = points.map(function (pos) {
	  return { pos: pos, force: { x: 0, y: 0 } };
	});


	new benchmark.Suite((" build from " + N + " points"), options)
	.add('d3-quadtree', function () {
	  var q = quadtree(points, function (p) { return p.x; }, function (p) { return p.y; });
	}).add('AVH', function () {
	  var a = new ArrayTree(points, { recursive: false });
	}).add('BVH', function () {
	  var b = new phtree_umd(points, { recursive: false });
	}).add('BVH-recursive', function () {
	  var b = new phtree_umd(points);
	}).add('BVH-morton', function () {
	  var b = new phtree_umd(points, { sfc: phtree_umd.SFC.MORTON });
	}).add('BVH reduced (bucket)', function () {
	  var b = new phtree_umd(points, { bucketSize: Math.floor(Math.log(N)) });
	}).add('mourner/kdbush', function () {
	  var kd = kdbush(points, function (p) { return p.x; }, function (p) { return p.y; }, 1);
	}).add('hgraph.quadtreebh', function () {
	  var q = ngraph_quadtreebh();
	  q.insertBodies(pointsbh);
	}).add('simple kd', function () {
	  var q = new skd(points);
	}).add('in-place kdtree', function () {
	  var k = new KDTree$1(points);
	}).add('UB-tree', function () {
	  var u = new UBTree(points);
	}).add('dynamic kd-tree', function () {
	  var dkd = new KDTree(points, function (d) { return d.x; }, function (d) { return d.y; });
	}).add('double-sort', function () {
	  var X = new Array(points.length);
	  var Y = new Array(points.length);
	  var byX = new Array(points.length), byY = new Array(points.length);
	  for (var i = 0; i < points.length; i++) {
	    var ref = points[i];
	    var x = ref.x;
	    var y = ref.y;
	    X[i] = x; Y[i] = y;
	    byX[i] = byY[i] = i;
	  }
	  sort(byX, X);
	  sort(byY, Y);
	}).add('simple q', function () {
	  var q = new QuadTree(points);
	}).add('linear-quadtree', function () {
	  var lq = new build$1(points);
	}).add('sfc tree', function () {
	  var sfc = new SFCTree(points, { getX: function (p) { return p.x; },  getY: function (p) { return p.y; } });
	}).run();

}());
