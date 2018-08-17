class Node {
  constructor(id) {
    this.id = id;
    this.count = 0;
    this.topLeft = this.topRight = this.bottomLeft = this.bottomRight = null;
  }
}

const maxx = (1 << 30);
const maxy = (1 << 30);

function insert(node, ax, ay, bx, by, x, y, id) {
  if (ax > x || x > bx || ay > y || y > by) return node;
  if (node === null) node = new Node(id);
  node.count++;
  if (ax === bx && ay === by) return node;

  const mx = (ax + bx) >> 1;
  const my = (ay + by) >> 1;

  node.bottomLeft  = insert(node.bottomLeft, ax, ay, mx, my, x, y, id);
  node.topLeft     = insert(node.topLeft, ax, my + 1, mx, by, x, y, id);
  node.bottomRight = insert(node.bottomRight, mx + 1, ay, bx, my, x, y, id);
  node.topRight    = insert(node.topRight, mx + 1, my + 1, bx, by, x, y, id);
  return node;
}

export default class QuadTree {

  constructor(points) {
    this.root = null;
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      this.root = insert(this.root, 0, 0, maxx - 1, maxy - 1, x, y, i);
    }
  }
}
