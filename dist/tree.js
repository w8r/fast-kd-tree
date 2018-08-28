(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "morton"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var morton_1 = require("morton");
    function qsort(data, values, left, right) {
        if (left >= right)
            return;
        var pivot = values[(left + right) >> 1];
        var i = left - 1;
        var j = right + 1;
        var temp;
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
    function sort(coords, codes) {
        return qsort(coords, codes, 0, coords.length - 1);
    }
    function __clz(m) {
        var c = 1 << 31;
        for (var i = 0; i < 31; i += 1) {
            if (c & m)
                return i;
            c >>>= 1;
        }
        return 32;
    }
    function findSplit(codes, first, last) {
        var f = codes[first];
        var l = codes[last];
        if (f === l)
            return (first + last) >> 1;
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
                if (splitPrefix > commonPrefix)
                    split = newSplit; // accept proposal
            }
        } while (step > 1);
        return split;
    }
    function build(data, ids, codes, first, last) {
        if (last - first === 0)
            return new Leaf(codes[first], data[ids[first]]);
        var split = findSplit(codes, first, last);
        var left = build(data, ids, codes, first, split);
        var right = build(data, ids, codes, split + 1, last);
        return new InternalNode(split, left, right);
    }
    function buildBuckets(data, ids, codes, first, last, bucketSize) {
        if (last - first <= bucketSize) {
            var bucket = new Array(last - first + 1);
            for (var i = first, j = 0; i <= last; i++, j++)
                bucket[j] = data[ids[i]];
            return new BucketLeaf(codes[first], bucket);
        }
        var split = findSplit(codes, first, last);
        var left = buildBuckets(data, ids, codes, first, split, bucketSize);
        var right = buildBuckets(data, ids, codes, split + 1, last, bucketSize);
        return new InternalNode(split, left, right);
    }
    function defaultGetY(data) {
        return data.y;
    }
    function defaultGetX(data) {
        return data.x;
    }
    var InternalNode = /** @class */ (function () {
        function InternalNode(key, left, right) {
            this.key = key;
            this.left = left;
            this.right = right;
        }
        return InternalNode;
    }());
    exports.InternalNode = InternalNode;
    var Leaf = /** @class */ (function () {
        function Leaf(key, data) {
            this.key = key;
            this.data = data;
        }
        return Leaf;
    }());
    exports.Leaf = Leaf;
    var BucketLeaf = /** @class */ (function () {
        function BucketLeaf(key, data) {
            this.key = key;
            this.data = data;
        }
        return BucketLeaf;
    }());
    exports.BucketLeaf = BucketLeaf;
    var Tree = /** @class */ (function () {
        function Tree(data, getX, getY, nodeSize) {
            if (getX === void 0) { getX = defaultGetX; }
            if (getY === void 0) { getY = defaultGetY; }
            if (nodeSize === void 0) { nodeSize = 0; }
            var n = data.length;
            var codes = new Uint32Array(n);
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            var p, i, x, y;
            this._x = getX;
            this._y = getY;
            var project = morton_1["default"];
            this._project = project;
            var ids = new Uint32Array(n);
            for (i = 0; i < n; i++) {
                p = data[i];
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
            this.xmin = minX;
            this.ymin = minY;
            this.xmax = maxX;
            this.ymax = maxY;
            var max = (1 << 16) - 1;
            var w = max / (maxX - minX);
            var h = max / (maxY - minY);
            for (i = 0; i < n; i++) {
                p = data[i];
                codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
            }
            sort(ids, codes);
            if (nodeSize === 0) {
                this._root = build(data, ids, codes, 0, n - 1);
            }
            else {
                this._root = buildBuckets(data, ids, codes, 0, n - 1, nodeSize);
            }
            /** @type {Number} */
            this._nodeSize = nodeSize;
        }
        return Tree;
    }());
    exports["default"] = Tree;
});
//# sourceMappingURL=tree.js.map