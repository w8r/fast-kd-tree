import sort from './sort';
import hilbert from './hilbert';

export default class KDTree {
  constructor (points, x = p => p.x, y = p => p.y) {
    const n       = points.length;
    const hvalues = new Array(n);
    const order   = new Array(n);

    for (let i = 0; i < n; i++) {
      const p = points[i];
      hvalues[i] = hilbert(p.x, p.y);
      order[i]  = i;
    }
    sort(order, hvalues);
    this._list = toList(points, order);
    this._root = sortedListToBST({ head: this._list }, 0, n);
  }
}


function toList (nodes, order) {
  const list = { next: null };
  let prev = list;
  for (let i = 0; i < nodes.length; i++) {
    prev = prev.next = { point: nodes[order[i]] };
  }
  prev.next = null;
  return list.next;
}


function sortedListToBST (list, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const left = sortedListToBST(list, start, middle);

    const root = list.head;
    root.left = left;
    if (root.left) root.left.parent = root;

    list.head = list.head.next;

    root.right = sortedListToBST(list, middle + 1, end);
    if (root.right) root.right.parent = root;
    return root;
  }

  return null;
}
