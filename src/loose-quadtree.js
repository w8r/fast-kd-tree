export default class LooseQuadtree {

  constructor (points, getX = p => p.x, getY = p => p.y) {
    this._getX = getX;
    this._getY = getY;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      this.insert(getX(point), getY(point), point);
    }
  }

  insert(x, y, point) {
    if (!this._root) {
      this._root = { data: point, minX: x, minY: y, maxX: x, maxY: y };
    } else {
      const Q = [this._root];
      while (Q.length !== 0) {
        const node = Q.pop();
        if (node.minX < x && x < node.maxX && node.minY < y && y < node.maxY) {
          if (node.data) {
            const cx = (node.maxX + node.minX) / 2;
            const cy = (node.maxY + node.minY) / 2;
            node.sw = { minX: node.minX, minY: node.minY, maxX: cx, maxY: cy };
            node.se = { minX: cx, minY: node.minY, maxX: node.maxX, maxY: cy };
            node.nw = { minX: node.minX, minY: cx, maxX: cx, maxY: node.maxY };
            node.se = { minX: cx, minY: cy, maxX: node.maxX, maxY: node.maxY };

          } else Q.push(node.ne, node.nw, node.sw, node.se);
        }
      }
    }

    return this;
  }
}