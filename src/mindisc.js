function circleContainsCircle(cx, cy, cr, x, y, r) {
  const dx = cx - x;
  const dy = cy - y;
  const dr = cr - r;
  // reduce precision not to deal with square roots
  return (dx * dx + dy * dy) < (dr * dr + 1e-6);
}

function from2discs(ax, ay, bx, by, ar, br) {
  const dx = bx - ax;
  const dy = by - ay;
  const dr = br - ar;
  const l = Math.sqrt(dx * dx + dy * dy);

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


export default function minDisc (points, bounds, n, X, Y, R) {
  var circle = null;

  if (n === 0 || bounds.length === 3) {
    circle = combine(points, bounds, X, Y, R);
  } else {
    const u = points[n - 1];
    circle = minDisc(points, bounds, n - 1, X, Y, R);
    if (circle === null || !circleContainsCircle(circle[0], circle[1], circle[2], X(u), Y(u), R(u))) {
      bounds.push(u);
      circle = minDisc(points, bounds, n - 1, X, Y, R);
      bounds.pop();
    }
  }

  return circle;
}
