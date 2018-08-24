export default class BST {
  inOrder (fn, ctx) {
    let current = this._root;
    const Q = [];
    let done = false;

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          if (fn.call(ctx, current)) break;
          current = current.right;
        } else done = true;
      }
    }
    return this;
  }


  preOrder (fn, ctx) {
    const Q = [this._root];
    while (Q.length !== 0)  {
      const node = Q.pop();
      if (!fn.call(ctx, node)) {
        if (node.right) Q.push(node.right);
        if (node.left)  Q.push(node.left);
      }
    }
    return this;
  }


  postOrder (fn, ctx) {
    const Q = [];
    let node = this._root, last;
    do {
      while (node) {
        if (node.right) Q.push(node.right);
        Q.push(node);
        node = node.left;
      }
      node = Q.pop();
      last = Q.length - 1;
      if (node.right && Q[last] === node.right) {
        Q[last] = node;
        node = node.right;
      } else {
        fn.call(ctx, node);
        node = null;
      }
    } while (Q.length !== 0);

    return this;
  }


  map (fn, ctx) {
    const res = [];
    this.inOrder(node => {
      res.push(fn.call(ctx, node));
    });
    return res;
  }
}
