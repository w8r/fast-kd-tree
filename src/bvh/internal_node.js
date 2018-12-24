export default class InternalNode {
  constructor (code, left, right) {
    this.code   = code;
    this.left   = left;
    this.right  = right;
    left.parent = right.parent = this;

    // this.x0 = Math.min(left.x0, right.x0);
    // this.y0 = Math.min(left.y0, right.y0);
    // this.x1 = Math.max(left.x1, right.x1);
    // this.y1 = Math.max(left.y1, right.y1);
  }
}
