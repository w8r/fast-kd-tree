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

  // int count(Node node, int ax, int ay, int bx, int by, int x1, int y1, int x2, int y2) {
  //   if (node == null || ax > x2 || x1 > bx || ay > y2 || y1 > by)
  //     return 0;
  //   if (x1 <= ax && bx <= x2 && y1 <= ay && by <= y2)
  //     return node.count;

  //   int mx = (ax + bx) >> 1;
  //   int my = (ay + by) >> 1;

  //   int res = 0;
  //   res += count(node.bottomLeft, ax, ay, mx, my, x1, y1, x2, y2);
  //   res += count(node.topLeft, ax, my + 1, mx, by, x1, y1, x2, y2);
  //   res += count(node.bottomRight, mx + 1, ay, bx, my, x1, y1, x2, y2);
  //   res += count(node.topRight, mx + 1, my + 1, bx, by, x1, y1, x2, y2);
  //   return res;
  // }
}
