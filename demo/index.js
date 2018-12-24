import seedrandom from 'seedrandom';
import phtree from '../src/phtree';
import sfctree from '../src/bvh/bvh';
import ubtree from '../src/ubtree';
import { minDisc } from '../src/mindisc';


Math.seedrandom('query');

var svg = d3.select("svg");
var width  = document.documentElement.clientWidth;
var height = document.documentElement.clientHeight;
svg.attr("width", width);
svg.attr("height", height);
var selected;

var random = Math.random, n = 1000;

var data = window.data = d3.range(n).map(function() {
  return [random() * width, random() * height];
});
// var data = new Array(n).fill(0).map((_, i) => {
//   return i < (n / 2) ?
//     [width / 4 * random(), height / 4 * random()] :
//     [width * random(), height * random()];
// });

// const cells = Math.sqrt(n) | 0;
// let x = width / cells / 2, y = -height / cells / 2;
// const data = new Array(n).fill(0).map((_, i) => {
//   if (i % cells === 0) {
//     y += height / cells;
//     x = width / cells / 2;
//   }
//   const pt = [ x, y ];
//   x += width / cells;
//   return pt;
// });

const nodeSize = /bucket/.test(window.location.hash) ? (Math.log(n) | 0) : 0;
console.log(nodeSize);
console.time('build');
var tree = new phtree(data, p => p[0], p => p[1], nodeSize, phtree.SFC.HILBERT);
console.timeEnd('build');

// console.time('build sfc');
// var tree = new sfctree(data, p => p[0], p => p[1], nodeSize, 'hilbert');
// console.timeEnd('build sfc');

console.time('quadtree');
var quadtree = new d3.quadtree(data, p => p[0], p => p[1]);
console.timeEnd('quadtree');

console.time('ubtree');
var u = new ubtree(data, p => p[0], p => p[1]);
console.timeEnd('ubtree');
window.u = u;
window.tree = tree;
window.phtree = phtree;

svg
  .append('path')
  .attr('d', d3.line()
    .x(d => d[0])
    .y(d => d[1])(getData(tree)))
  .attr('stroke-width', 2)
  .attr('fill', 'none')
  .attr('stroke', 'darkblue')
  .attr('stroke-opacity', 0.25);

var brush = d3.brush()
    .on("brush", brushed);

var point = svg.selectAll(".point")
  .data(data)
  .enter().append("circle")
    .attr("class", "point")
    .attr("cx", d => d[0])
    .attr("cy", d => d[1])
    .attr("r", 2);

svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [[100, 100], [200, 200]]);

function brushed() {
  var extent = d3.event.selection;
  point.each(function(d) { d.scanned = d.selected = false; });
  search(tree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
  point.classed("point--scanned", function(d) { return d.scanned; });
  point.classed("point--selected", function(d) { return d.selected; });
  point.classed("point--focus", function(d) { return d.focus; });
}

function clear() {
  data.map(p => p.scanned = p.selected = false);
  show();
}

function show () {
  point.classed("point--selected", function(d) { return d.selected; });
  point.classed("point--scanned", function(d) { return d.scanned; });
  point.classed("point--focus", function(d) { return d.focus; });
}

// Find the nodes within the specified rectangle.
function search(tree, x0, y0, x3, y3) {
  tree.query(x0, y0, x3, y3).map((point) => {
    point.selected = true;
  });
  // quadtree.visit(function(node, x1, y1, x2, y2) {
  //   if (!node.length) {
  //     do {
  //       var d = node.data;
  //       d.scanned = true;
  //       d.selected = (d[0] >= x0) && (d[0] < x3) && (d[1] >= y0) && (d[1] < y3);
  //     } while (node = node.next);
  //   }
  //   return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
  // });
}

// Collapse the quadtree into an array of rectangles.
function nodes(tree) {
  var nodes = [];
  // tree.walk((node, x0, y0, x1, y1) => {
  //   node.x0 = x0, node.y0 = y0;
  //   node.x1 = x1, node.y1 = y1;
  //   nodes.push(node);
  // });
  const collect = tree._bucketSize === 0
    ? n => { if (!n.data) nodes.push(n); }
    : n => { nodes.push(n); };
  tree.postOrder(getTightBoxes);
  tree.preOrder(collect);
  return nodes;
}

function nodesUB(tree) {
  var nodes = [];
  // tree.walk((node, x0, y0, x1, y1) => {
  //   node.x0 = x0, node.y0 = y0;
  //   node.x1 = x1, node.y1 = y1;
  //   nodes.push(node);
  // });
  tree.postOrder(getTightBoxesBST);
  tree.preOrder(n => { nodes.push(n); });
  return nodes;
}


function visit (n, fn) {
  if (n) {
    visit(n.left, fn);
    if (n.data) fn(n.data);
    visit(n.right, fn);
  }
}


function accumulate(node) {
  let mass = 0;
  if (node.data) mass += 1; // or get mass otherwise
  else {
    if (node.left && node.left.mass)  mass += node.left.mass;
    if (node.left && node.right.mass) mass += node.right.mass;
  }
  node.mass = mass;
}

function getTightBoxes(node) {
  let xmin = tree._maxX, ymin = tree._maxY,
      xmax = tree._minX, ymax = tree._minY;
  if (node.data) {
    //const data = node.data;
    if (tree._bucketSize !== 0) {
      for (let i = 0; i < node.data.length; i++) {
        const data = node.data[i];
        const x = tree._x(data), y = tree._y(data);
        xmin = Math.min(xmin, x);
        ymin = Math.min(ymin, y);
        xmax = Math.max(xmax, x);
        ymax = Math.max(ymax, y);
      }
    } else {
      xmin = xmax = tree._x(node.data);
      ymin = ymax = tree._y(node.data);
    }
  } else {
    let child = node.left;
    if (child) {
      xmin = Math.min(xmin, child.x0);
      ymin = Math.min(ymin, child.y0);
      xmax = Math.max(xmax, child.x1);
      ymax = Math.max(ymax, child.y1);
    }
    child = node.right;
    if (child) {
      xmin = Math.min(xmin, child.x0);
      ymin = Math.min(ymin, child.y0);
      xmax = Math.max(xmax, child.x1);
      ymax = Math.max(ymax, child.y1);
    }
  }

  node.x0 = xmin;
  node.y0 = ymin;
  node.x1 = xmax;
  node.y1 = ymax;
}


function getData(tree) {
  const data = [];
  tree.preOrder(n => {
    if (n.data) {
      if (tree._bucketSize !== 0) data.push.apply(data, n.data);
      else data.push(n.data);
    }
  });
  return data;
}


console.time('bbox');
tree.postOrder(getTightBoxes);
console.timeEnd('bbox');


console.time('circles');
tree.postOrder((node) => {
  let cx, cy, r, m, child;
  if (node.data) {
    if (tree._bucketSize) {
      const circle = minDisc(node.data, [], node.data.length, tree._x, tree._y, () => 1);
      cx = circle[0]; cy = circle[1]; r = circle[2];
      m = node.data.length; // mass
    } else {
      cx = tree._x(node.data);
      cy = tree._y(node.data);
      r = 0;
      m = 1; // mass
    }
  } else {
    if (node.left && node.right) {
      const ax = node.left.cx,  ay = node.left.cy;
      const bx = node.right.cx, by = node.right.cy;
      const ar = node.left.r, br = node.right.r;
      const dx = bx - ax, dy = by - ay;

      const dr = br - ar;
      const l = Math.sqrt(dx * dx + dy * dy);

      cx = (ax + bx + dx / l * dr) / 2;
      cy = (ay + by + dy / l * dr) / 2;
      r = (l + ar + br) / 2;

      m = node.left.mass + node.right.mass; // mass
    } else {
      child = node.left || node.right;
      cx = child.cx;
      cy = child.cy;
      r = child.r;

      m = child.mass; // mass
    }
  }

  node.cx   = cx;
  node.cy   = cy;
  node.r    = r;
  node.mass = m;
});
console.timeEnd('circles');

tree.preOrder(n => (n.fx = n.fy = 0));

const theta = 0.62;
const charge = 1;
const friction = 0.1;
console.time('collect leafs');
const bodies = new Array(data.length)
const datas  = new Array(data.length);
(() => { // collect leafs
  let pos = 0;
  if (tree._bucketSize === 0) {
    tree.preOrder((n) => {
      if (n.data) {
        bodies[pos] = n;
        datas[pos] = n.data;
        pos++;
      }
    });
  } else {
    tree.preOrder(n => {
      if (n.data) {
        for (let i = 0; i < n.data.length; i++) {
          bodies[pos] = n;
          datas[pos]  = n.data;
          pos++;
        }
      }
    });
  }
})();
console.timeEnd('collect leafs');

console.time('bst tight');
u.postOrder(getTightBoxesBST);
console.timeEnd('bst tight');

console.time('ubtree accumulate');
u.postOrder((node) => {
  let cx, cy, r, m, child;

  cx = tree._x(node.data);
  cy = tree._y(node.data);
  r = 1;
  m = 1; // mass

  child = node.left;
  if (child) {
    const ax = cx,  ay = cy;
    const bx = child.cx, by = child.cy;
    const ar = r, br = child.r;
    const dx = bx - ax, dy = by - ay;

    const dr = br - ar;
    const l = Math.sqrt(dx * dx + dy * dy);

    cx = (ax + bx + dx / l * dr) / 2;
    cy = (ay + by + dy / l * dr) / 2;
    r = (l + ar + br) / 2;

    m += child.mass;
  }

  child = node.right;
  if (child) {
    const ax = cx,  ay = cy;
    const bx = child.cx, by = child.cy;
    const ar = r, br = child.r;
    const dx = bx - ax, dy = by - ay;

    const dr = br - ar;
    const l = Math.sqrt(dx * dx + dy * dy);

    cx = (ax + bx + dx / l * dr) / 2;
    cy = (ay + by + dy / l * dr) / 2;
    r = (l + ar + br) / 2;

    m += child.mass;
  }

  node.cx   = cx;
  node.cy   = cy;
  node.r    = r;
  node.mass = m;
});
console.timeEnd('ubtree accumulate');

function applyForces(data, tree) {
  let ops = 0;
  for (let i = 0; i < datas.length; i++) {
    const pt          = datas[i];
    const currentBody = bodies[i];

    let fx = 0, fy = 0;
    const x = tree._x(pt), y = tree._y(pt);
    const r = currentBody.r;
    const m = currentBody.mass;

    tree.preOrder((node) => {
      let dx = 0, dy = 0, c = 0, q = 0, dsq = 0, rmax = 0, sep = 0;
      if (node !== currentBody) {
        dx = x - node.cx;
        dy = y - node.cy;
        dsq = dx * dx + dy * dy;
        rmax = r + node.r;

        if (node.data) { // different leaf - direct calculation
          c = charge;
          if (dsq >= rmax * rmax) {
            c *= m * node.mass;
          } else {
            dsq = friction * rmax * rmax;
          }
          q = c / dsq;
          fx += dx * q;
          fy += dy * q;
          ops++;
        } else { // different body - is it well-separated?
          sep = rmax / theta;
          if (dsq >= sep * sep) { // then use it as a solid body
            c = charge;
            if (dsq >= rmax * rmax) {
              c *= m * node.mass;
            } else {
              dsq = friction * rmax * rmax;
            }
            q = c / dsq;
            fx += dx * q;
            fy += dy * q;
            ops++;
            return true; // and stop descending
          }
        }
      } /*else if (tree._bucketSize !== 0) { // same leaf, bucket
        for (let j = 0; j < node.data.length; j++) { // direct calc
          const body = node.data[i];

          if (body !== data) continue;

          dx = x - tree._x(body);
          dy = y - tree._y(body);
          dsq = dx * dx + dy * dy;
          c = charge;
          rmax = r + node.r;

          if (dsq >= (rmax * rmax)) {
            c *= currentBody.mass * node.mass;
          } else {
            dsq = friction * rmax * rmax;
          }
          q = c / dsq;
          fx += dx * q;
          fy += dy * q;
        }
      }*/
    });

    currentBody.fx = fx;
    currentBody.fy = fy;
  }
  return ops;
}


function directCalc(data) {
  let FX = new Array(data.length), FY = new Array(data.length);
  let ops = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i][0], y = data[i][1], ra = 1, ma = 1;
    for (let j = i + 1; j < data.length; j++) {
      const x1 = data[j][0], y1 = data[j][1], rb = 1, mb = 1;
      const dx = x - x1;
      const dy = y - y1;
      let dsq = dx * dx + dy * dy;
      let c = charge;
      const rmax = ra + rb;

      if (dsq >= (rmax * rmax)) {
        c *= ma * mb;
      } else {
        dsq = friction * rmax * rmax;
      }
      const q = c / dsq;
      FX[i] += dx * q;
      FY[i] += dy * q;
      FX[j] -= dx * q;
      FY[j] -= dy * q;
      ops++;
    }
  }
  return ops;
}


(() => {
  const cur = bodies[n >> 1];
  const pt = datas[n >> 1];
  pt.selected = true;
  pt.focus    = true;
  cur.focus   = true;


  if (tree._bucketSize !== 0) {
    pt.forEach(p => p.focus = true);
  }

  tree.preOrder(node => {
    if (node !== cur) {
      if (node.data) {
        if (tree._bucketSize === 0) {
          node.data.selected = true;
        } else {
          const dx = cur.cx - node.cx;
          const dy = cur.cy - node.cy;
          const dsq = dx * dx + dy * dy;
          const rmax = cur.r + node.r;
          if (dsq >= (rmax / theta) * (rmax / theta)) {
            node.scanned = true;
          } else {
            for (let i = 0; i < node.data.length; i++) {
              node.data[i].selected = true;
            }
          }
        }
      } else {
        const dx = cur.cx - node.cx;
        const dy = cur.cy - node.cy;
        const dsq = dx * dx + dy * dy;
        const rmax = cur.r + node.r / theta;

        if (dsq >= (rmax / theta) * (rmax / theta)) {
          node.scanned = true;
          return true;
        }
      }
    }
  });
  show();
}) ();


quadtree.visitAfter((quad) => {
  var strength = 0, q, c, weight = 0, x, y, i;

  // For internal nodes, accumulate forces from child quadrants.
  if (quad.length) {
    for (x = y = i = 0; i < 4; ++i) {
      if ((q = quad[i]) && (c = Math.abs(q.value))) {
        strength += q.value, weight += c, x += c * q.x, y += c * q.y;
      }
    }
    quad.x = x / weight;
    quad.y = y / weight;
  }

  // For leaf nodes, accumulate forces from coincident quadrants.
  else {
    q = quad;
    q.x = q.data[0];
    q.y = q.data[1];
    do strength += 30;
    while (q = q.next);
  }

  quad.value = strength;
});

function quadApply () {
  const distanceMin2 = 1,
      distanceMax2 = Infinity,
      theta2 = 0.81;
  let ops = 0;
  for (let i = 0; i < n; i++) {
    const node = data[i];
    quadtree.visit((quad, x1, _, x2) => {
      var x = quad.x - node[0],
          y = quad.y - node[1],
          w = x2 - x1,
          l = x * x + y * y;

      // Apply the Barnes-Hut approximation if possible.
      // Limit forces for very close nodes; randomize direction if coincident.
      if (w * w / theta2 < l) {
        if (l < distanceMax2) {
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
          node.vx += x * 1 / l;
          node.vy += y * 1 / l;
          ops++;
        }
        return true;
      }

      // Otherwise, process points directly.
      else if (quad.length || l >= distanceMax2) return;

      // Limit forces for very close nodes; randomize direction if coincident.
      if (quad.data !== node || quad.next) {
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
      }

      do if (quad.data !== node) {
        w = 30 / l;
        node.vx += x * w;
        node.vy += y * w;
        ops++;
      } while (quad = quad.next);
    });
  }
  return ops;
}


function getTightBoxesBST (node) {
  //const data = node.data;
  let xmin = tree._x(node.data);
  let xmax = xmin;
  let ymin = tree._y(node.data);
  let ymax = ymin;

  let child = node.left;
  if (child) {
    xmin = Math.min(xmin, child.x0);
    ymin = Math.min(ymin, child.y0);
    xmax = Math.max(xmax, child.x1);
    ymax = Math.max(ymax, child.y1);
  }
  child = node.right;
  if (child) {
    xmin = Math.min(xmin, child.x0);
    ymin = Math.min(ymin, child.y0);
    xmax = Math.max(xmax, child.x1);
    ymax = Math.max(ymax, child.y1);
  }

  node.x0 = xmin;
  node.y0 = ymin;
  node.x1 = xmax;
  node.y1 = ymax;
}


svg.selectAll(".node")
  .data(nodes(tree))
  .enter().append("rect")
    .attr("class", d => d.scanned ? 'node node--scanned' : 'node')
    .attr("x", d  => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);


const med = svg.selectAll(".med")
  .data(tree.map((n) => [n.cx, n.cy, n.r, n.scanned, n.focus]))
  .enter().append("circle")
    .attr("class", d => d[4] ? 'med med--focus' : "med")
    .attr("cx", d => d[0])
    .attr("cy", d => d[1])
    .attr("r",  d => d[2]);


tree.preOrder(n => {
  if (n.focus) {
    svg.append('circle')
      .attr('class', 'med--outer')
      .attr('cx', n.cx)
      .attr('cy', n.cy)
      .attr('r', (n.r || 4) / theta);
    return true;
  }
});


// svg.selectAll(".node")
//   .data(nodesUB(u))
//   .enter().append("rect")
//     .attr("class", d => d.scanned ? 'node node--scanned' : 'node')
//     .attr("x", d  => d.x0)
//     .attr("y", d => d.y0)
//     .attr("width", d => d.x1 - d.x0)
//     .attr("height", d => d.y1 - d.y0);


// const med = svg.selectAll(".med")
//   .data(u.map((n) => [n.cx, n.cy, n.r, n.scanned]))
//   .enter().append("circle")
//     .attr("class", "med")
//     .attr("cx", d => d[0])
//     .attr("cy", d => d[1])
//     .attr("r",  d => d[2]);
