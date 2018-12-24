export function inOrder (fn, ctx) {
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


export function preOrder (fn, ctx) {
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


export function postOrder (fn, ctx) {
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


export function map (fn, ctx) {
  const res = [];
  this.inOrder(node => {
    res.push(fn.call(ctx, node));
  });
  return res;
}


/**
   * Tree height
   * @return {Number}
   */
export function height () {
  return treeHeight(this._root);
}


  /**
   * Print tree
   * @public
   * @export
   * @param  {Function(Node):String} [printNode]
   * @return {String}
   */
export function toString (printNode = (n) => n.code) {
  const out = [];
  row(this._root, '', true, (v) => out.push(v), printNode);
  return out.join('');
}


  /**
   * Number of nodes
   * @return {Number}
   */
export function size () {
  let i = 0;
  this.preOrder(() => { i++; });
  return i;
}


function treeHeight (node) {
  return node ? (1 + Math.max(treeHeight(node.left), treeHeight(node.right))) : 0;
}


/**
 * Prints level of the tree
 * @param  {Node}                        root
 * @param  {String}                      prefix
 * @param  {Boolean}                     isTail
 * @param  {Function(in:string):void}    out
 * @param  {Function(node:Node):String}  printNode
 */
function row (root, prefix, isTail, out, printNode) {
  if (root) {
    out(prefix + (isTail ? '^-- ' : '|-- ') + printNode(root) + '\n');
    const indent = prefix + (isTail ? '    ' : '|   ');
    if (root.left)  row(root.left,  indent, false, out, printNode);
    if (root.right) row(root.right, indent, true,  out, printNode);
  }
}
