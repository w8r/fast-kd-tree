class Node {
  constructor () {

  }
}

export default class KDTree {

  constructor (data, getX = d => d.x, getY = d => d.y) {
    this._root = null;

    this._x = getX;
    this._y = getY;

    const indexes = new Array(data.length);
    for (let i = 0; i < data.length; i++) indexes[i] = i;

    this._root = buildNode(0, data.length, data, indexes, getX, getY);
  }


  insert (x, y, data) {

  }
}


function buildNode(begin, end, keys, indexes, getX, getY) {
  const d = keys[0].length;
  const node = new Node();

  // Fill in basic info
  node.count = end - begin;
  node.index = begin;

  // Calculate the bounding box
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let i = begin; i < end; i++) {
    const d = keys[indexes[i]];
    const x = getX(d), y = getY(d);

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  
  // Calculate bounding box stats
  let maxRadius = -1;
  let rx = maxX - minX, ry = maxY - minY;
  let getter;

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
  let i1 = begin, i2 = end - 1, size = 0;
  while (i1 <= i2) {
    let i1Good = getter(keys[indexes[i1]]) < node.cutoff;
    let i2Good = getter(keys[indexes[i2]]) >= node.cutoff;

    if (!i1Good && !i2Good) {
      const temp = indexes[i1];
      indexes[i1] = indexes[i2];
      indexes[i2] = temp;
      i1Good = i2Good = true;
    }

    if (i1Good) {
      i1++;
      size++;
    }

    if (i2Good) i2--;
  }

  // Create the child nodes
  node.lower = buildNode(begin, begin + size, keys, indexes, getX, getY);
  node.upper = buildNode(begin + size, end, keys, indexes, getX, getY);

  return node;
}
