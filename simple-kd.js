export default class skd {
  constructor(points) {
    const n = points.length;
    this.ids = new Array(n);
    this.tx  = new Array(n);
    this.ty  = new Array(n);

    for (let i = 0; i < n; i++) points[i].id = i;

    build(0, n, true, points, this.tx, this.ty, this.ids);
  }
}

function build(low, high, dim, points, tx, ty, ids) {
  if (low >= high) return;
  const mid = (low + high) >>> 1;
  nth_element(points, low, high, mid, dim);

  const p = points[mid];
  tx[mid]  = p.x;
  ty[mid]  = p.y;
  ids[mid] = p.id;

  build(low,      mid, !dim, points, tx, ty, ids);
  build(mid + 1, high, !dim, points, tx, ty, ids);
}

// See: http://www.cplusplus.com/reference/algorithm/nth_element
function nth_element (a, low, high, n, divX) {
  while (true) {
    const k = partition(a, low, high, divX);
    if (n < k) high = k;
    else if (n > k) low = k + 1;
    else break;
  }
}

function partition (a, low, high, divX) {
  swap(a, low + (Math.random() * (high - low))|0, high - 1);
  const v = divX ? a[high - 1].x : a[high - 1].y;
  let i = low - 1;
  for (let j = low; j < high; j++) {
    const p = a[j];
    if (divX ? p.x <= v : p.y <= v) swap(a, ++i, j);
  }
  return i;
}

function swap (a, i, j) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}
