//import hilbert from './hilbert';

var X = [ 0, 1 ], Y = [ 0, 2 ];
for (var i = 4; i < 0xFFFF; i <<= 2) {
    for (var j = 0, l = X.length; j < l; j++) {
        X.push((X[j] | i));
        Y.push((X[j] | i) << 1);
    }
}

// Only works for 24 bit input numbers (up to 16777215).
function sfc(x, y) {
    return (Y[y         & 0xFF] | X[x         & 0xFF]) +
           (Y[(y >> 8)  & 0xFF] | X[(x >> 8)  & 0xFF]) * 0x10000 +
           (Y[(y >> 16) & 0xFF] | X[(x >> 16) & 0xFF]) * 0x100000000;
};

class QuaternaryTree {
  constructor (data, getX = d => d.x, getY = d => d.y, depth = 3) {
    this._depth = depth;
    this._x = getX;
    this._y = getY;

    this._root = { level: 0, parent: null, leaf: false, x: 0, y: 0 };

    const Q = [this._root];
    while (Q.length !== 0) {
      const n = Q.pop();
      if (n.level < depth) {
        const px = parent.x << 1, py = parent.y << 1;
        for (let i = 0; i < 4; i++) {
          n[i] = { level: n.level + 1, parent: n, x: px + (i % 2), y: py };
          Q.push(n[i]);
        }
      } else {
        n.leaf = true;
        leafs[sfc()]
      }
    }

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const x = this._x(d);
      const y = this._y(d);
    }
  }
}

/*
  _ _ _ _
 | | | | |
 +-+-+-+-+
 | | | | |
  - - - -

 */
