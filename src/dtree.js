import morton from 'morton';

/** \file
 *
 * \par License:
 * This file is part of the Open Graph Drawing Framework (OGDF).
 *
 * \par
 * Copyright (C)<br>
 * See README.md in the OGDF root directory for details.
 *
 * \par
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * Version 2 or 3 as published by the Free Software Foundation;
 * see the file LICENSE.txt included in the packaging of this file
 * for details.
 *
 * \par
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * \par
 * You should have received a copy of the GNU General Public
 * License along with this program; if not, see
 * http://www.gnu.org/copyleft/gpl.html
 */
const Dim = 2;
//! the maximum number of children per node = 2^d
const MaxNumChildrenPerNode = 1 << Dim;
const sizeInt = 32;

//! The entry in the sorted order for a point
class MortonEntry {
  constructor () {
    this.mortonNr = []; //!< the morton number of the point
    this.ref; //!< index in the original point order
  }

  //! less comparator for sort
  less (other) {
    return mortonComparerLess(mortonNr, other.mortonNr);
  }

  //! equal comparer for the construction algorithm
  equals (other) {
    return mortonComparerEqual(mortonNr, other.mortonNr);
  }
}


//! The node class
class Node {
  constructor () {
    // quadtree related stuff
    this.level = 0; //!< the level of the node in a complete quadtree
    this.next = null; //!< the next node on the same layer (leaf or inner node layer)
    this.child = new Array(MaxNumChildrenPerNode); //!< index of the children
    this.numChilds = 0; //!< number of children
    this.firstPoint = 0; //!< the first point in the sorted order covered by this subtree
    this.numPoints = 0; //!< the number of points covered by this subtree
  }
}

class DTree {

  constructor (points) {
    this.m_points = points;
    this.m_numPoints = points.length; //!< Total number of points

    this.m_maxLevel = ((sizeof(IntType) << 3) + 1)
    this.m_rootIndex = -1; //!< The index of the root node

    this.m_mortonOrder = null; //!< The order to be sorted
    this.m_nodes = null; //!< Memory for all nodes

    this.allocate(numPoints);

    this.prepareMortonOrder();

    // sort the morton numbers
    this.sortMortonNumbers();

    // prepare the node layer
    this.prepareNodeLayer();

    //! link the inner nodes using the recursive bottom-up method
    this.linkNodes();
  }


  //! Just to access the nodes a little bit easier
  node (i) {
    return this.m_nodes[i];
  }


  //! returns the number of children of node i
  numChilds (i) {
    return this.m_nodes[i].numChilds;
  }

  //! returns the index of the j th child of node i
  child (i, j) {
    return this.m_nodes[i].child[j];
  }

  //! returns the number of points covered by this subtree
  numPoints (i) {
    return this.m_nodes[i].numPoints;
  }

  //! returns the index of the jth point covered by i's subtree.
  point (i, j) {
    return this.m_mortonOrder[this.m_nodes[i].firstPoint + j].ref;
  }


  //! sets the point to the given grid coords
  setPoint(i, d, value) {}


  //! returns the maximum number of nodes (and the max index of a node)
  maxNumNodes () {
    return this.m_numPoints * 2;
  }

  //! returns the ith point in the input sequence
  point (i) {
    return this.m_points[i];
  }

  //! Prepares the morton numbers for sorting
  prepareMortonOrder () {}

  //! Sorts the points by morton number
  sortMortonNumbers () {}

  //! Prepares both the leaf and inner node layer
  prepareNodeLayer () {}

  //! Merges curr with next node in the chain (used by linkNodes)
  mergeWithNext (curr) {}

  //! used to update the first and numPoints of inner nodes by linkNodes
  adjustPointInfo (curr) {}

  //! Does all required steps except the allocate, deallocate, randomPoints
  build () {}

  //! returns the index of the root node
  rootIndex () {
    return this.m_rootIndex;
  }

  //! Allocates memory for n points
  allocate (n) {}

  //! Releases memory
  deallocate () {}


  //! allocates memory for n points
  allocate (n) {
    this.m_numPoints = n;
    this.m_points = new Array(n);
    this.m_mortonOrder = new Array(n);
    this.m_nodes = new Array(n * 2);
  }


  setPoint (i, d, value) {
    // set i-th point d coord to value
    this.m_points[i].x[d] = value;
  }

  //! Prepares the morton numbers for sorting
  prepareMortonOrder() {
    // loop over the point order
    for (let i = 0; i < this.m_numPoints; i++) {
      // set i's ref to i
      this.m_mortonOrder[i].ref = i;

      // generate the morton number by interleaving the bits
      morton(m_points[i].x, m_mortonOrder[i].mortonNr);
    }
  }

  //! Sorts the points by morton number
  sortMortonNumbers () {
    // just sort them
    // use comparere
    m_mortonOrder.sort((a, b) => a - b);//, m_mortonOrder + m_numPoints);
  }


  //! Prepares both the leaf and inner node layer
  prepareNodeLayer () {
    let leafLayer  = this.m_nodes;
    let innerLayer = this.m_nodes + this.m_numPoints;

    for (let i = 0; i < this.m_numPoints;) {
      let leaf = leafLayer[i];
      let innerNode = innerLayer[i];
      // i represents the current node on both layers
      let j = i + 1;

      // find the next morton number that differs or stop when j is equal to m_numPoints
      while ((j < m_numPoints) &&
           (this.m_mortonOrder[i] === this.m_mortonOrder[j]))
        j++;
      // j is the index of the next cell (node)

      // init the node on the leaf layer
      leaf.firstPoint = i; //< node sits above the first point of the cell
      leaf.numPoints = j - i; //< number of points with equal morton numbers (number of points in grid cell)
      leaf.numChilds = 0; //< it's a leaf
      leaf.level = 0; //< it's a leaf
      leaf.next = j; //< this leaf hasnt been created yet but we use indices so its ok

      if (j < m_numPoints) {
        // Note: the n-th inner node is not needed because we only need n-1 inner nodes to cover n leaves
        // if we reach the n-1-th inner node, the variable last is set for the last time
        // init the node on the inner node layer
        innerNode.child[0] = i; //< node sits above the first leaf
        innerNode.child[1] = j; //< this leaf hasnt been created yet but we use indices so its ok
        innerNode.numChilds = 2; //< every inner node covers two leaves in the beginning
        innerNode.level = lowestCommonAncestorLevel<IntType, Dim>(m_mortonOrder[i].mortonNr, m_mortonOrder[j].mortonNr);
        innerNode.next = m_numPoints + j; // the inner node layer is shifted by n
      } else {
        // no next for the last
        innerLayer[i].next = 0;
        // this is important to make the recursion stop
        innerLayer[i].level = m_maxLevel + 1;
      }

      // advance to the next cell
      i = j;
    }
    // here we set the successor of the n-1-th inner node to zero to avoid dealing with the n-th inner node
    innerLayer[last].next = 0;
  }

  //! Merges curr with next node in the chain (used by linkNodes)
  mergeWithNext (curr) {
    const next = node(curr).next;
    // Cool: since we never touched node(next) before
    // it is still linked to only two leaves,
    this.node(curr).child[this.node(curr).numChilds++] = this.node(next).child[1];

    // thus we don't need this ugly loop:
    //   for (int i=1; i<node(next).numChilds; i++)
    //      node(curr).child[node(curr).numChilds++] = node(next).child[i];
    this.node(curr).next = this.node(next).next;
  }

  adjustPointInfo (curr) {
    // adjust the first such that it matched the first child
    this.node(curr).firstPoint = this.node(this.node(curr).child[0]).firstPoint;

    // index of the last child
    const lastChild = this.node(curr).child[this.node(curr).numChilds - 1];

    // numPoints is lastPoint + 1 - firstPoint
    this.node(curr).numPoints = this.node(lastChild).firstPoint +
      this.node(lastChild).numPoints - this.node(curr).firstPoint;
  }

  //! The Recursive Bottom-Up Construction
  linkNodesRecurse (curr, maxLevel) {
    // while the subtree is smaller than maxLevel
    while (this.node(curr).next && this.node(this.node(curr).next).level < maxLevel) {
      // get next node in the chain
      const next = this.node(curr).next;
      // First case: same level => merge, discard next
      if (this.node(curr).level === this.node(next).level) {
        this.mergeWithNext(curr);
      } else // Second case: next is higher => become first child
      if (this.node(curr).level < this.node(next).level) {
        // set the first child of next to the current node
        this.node(next).child[0] = curr;

        // adjust the point info of the curr
        this.adjustPointInfo(curr);

        // this is the only case where we advance curr
        curr = next;
      } else { // Third case: next is smaller => construct a maximal subtree starting with next
        int r = this.linkNodesRecurse(next, this.node(curr).level);
        this.node(curr).child[this.node(curr).numChilds - 1] = r;
        this.node(curr).next = this.node(r).next;
      }
    }
    // adjust the point info of the curr
    this.adjustPointInfo(curr);

    // we are done with this subtree, return the root
    return curr;
  }


  //! The Recursive Bottom-Up Construction (recursion start)
  linkNodes() {
    this.m_rootIndex = this.linkNodes(this.m_numPoints, this.m_maxLevel);
  }

  //! Just for fun: traverse the tree and count the points in the leaves
  countPoints (curr)  {
    if (this.m_nodes[curr].numChilds) {
      let sum = 0;
      for (let i = 0; i < this.m_nodes[curr].numChilds; i++) {
        sum += this.countPoints(m_nodes[curr].child[i]);
      }

      return sum;
    }
    else return this.m_nodes[curr].numPoints;
  }

  //! Does all required steps except the allocate, deallocate, randomPoints
  build () {
    // prepare the array with the morton numbers
  }
}
