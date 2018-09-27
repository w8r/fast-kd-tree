/** Implements point kd-tree index structure, as described in Bentley's
 * 1975 paper "Multidimensional binary search trees used for associative
 * searching". */

class Node {

  constructor (data) {
    this.data  = data;
    this.left  = null;
    this.right = null;
  }
}

const D = 2;

export default class KDTree {

  constructor (data, getX = d => d.x, getY = d => d.y) {
    this._x = getX;
    this._y = getY;

    this._root = null;

    for (let i = 0; i < data.length; i++) {
      this.insert(data[i]);
    }
  }

  /** Given the current dimension used to cut the data space, return
   * the next dimension that should be used. */
  nextdimension (dim) {
    return (dim + 1) % D;
  }

    
  insert (p) {
    let previous = null; // previous node traversed
    // Set to true if 'current' is left child of 'previous'
    let leftOfPrevious = false;
    let current = this._root;
    let dim = 0, getter = this._x;

    while (true) {
      if (current === null) {
        current = new Node(p);
        // Assign parent's correct child pointer to new node
        if (previous) {
          if (leftOfPrevious) previous.left = current;
          else                previous.right = current;
        } else { // if no parent, then ROOT NODE WAS INSERTED. Update root!
          this._root = current;
        }
        return true;
      } else if (getter(p) < getter(current.data)) {
        previous = current;
        current  = current.left;
        leftOfPrevious = true;
      } else if (p === current.data) { // Duplicate point, it already exists! Cannot insert point
        return false;
      } else {
        previous = current;
        current = current.right;
        leftOfPrevious = false;
      }
      dim = (dim + 1) % D;
      getter = dim ? this._y : this._x;
    }
  }

    
  query (p) {
    let current = this._root;
    let dim = 0;
    while (current) {// until end of tree is reached
      if (p === current.data) return current;
      else if (p[dim] < current.data[dim]) current = current.left;
      else                                  current = current.right;
      dim = (dim + 1) % D;
    }
    return null;
  }

  
  remove (p) {
    this._root = this.recursiveRemove(this._root, p, 0);
    return this;
  }


  recursiveRemove (node, p, dim) {
    if (node === null) return null;
    else if (p[dim] < node.data[dim]) {
      node.left = this.recursiveRemove(node.left, p, (dim + 1) % D);
    } else if (p[dim] > node.data[dim]) {
      node.right = this.recursiveRemove(node.right, p, (dim + 1) % D);
    } else { // found node that stores given point
      // If node with point is leaf node, simply delete it!
      if (node.left === null && node.right === null) {
        return null; // to remove reference to node in parent
      } else {
        // Find minimum point for cutting dimension and REPLACE node's point with it
        if (node.right) {
          node.data = this.findMinimum(node.right, dim, (dim + 1) % D);
          node.right = this.recursiveRemove(node.right, node.data, (dim + 1) % D);
        } else { // if there is no right child!!
          node.data = this.findMinimum(node.left, dim, (dim + 1) % D);
          node.left = this.recursiveRemove(node.left, node.data, (dim + 1) % D);
          // Swap left child with right child
          node.right = node.left;
          node.left = null;
        }
      }
    }
    // If this point is reached, node should not be removed so we
    // just return the node
    return node;
  }

    
  findMinimum (node, cdim, dim) {
    // Reached leaf node
    if (node === null) return null;
    
    // If cutting cdim is dimension we're looking for minimum in,
    // just search left child!
    else if (cdim === dim) {
      if (node.left === null) return node.data;
      else return this.findMinimum(node.left, cdim, (dim + 1) % D);
    } else { // Otherwise, we have to search BOTH children
      const a = this.findMinimum(node.left, cdim, (dim + 1) % D);
      const b = this.findMinimum(node.right, cdim, (dim + 1) % D);
      if (a && b) { // if minimums were returned from both children
        const minVal = Math.min(node.data[cdim], Math.min(a[cdim], b[cdim]));
        if (minVal === node.data[cdim]) return node.data;
        else if (minVal === a[cdim])    return a;
        else                                 return b;
      } else if (a) { // if minimum was just returned from left child
        const minVal = Math.min(node.data[cdim], a[cdim]);
        if (minVal === node.data[cdim]) return node.data;
        else                                 return a;
      } else if (b) { // if minimum was just returned from right child
        const minVal = Math.min(node.data[cdim], b[cdim]);
        if (minVal === node.data[cdim]) return node.data;
        else                                 return b;
      } else return node.data;
    }
  }
}