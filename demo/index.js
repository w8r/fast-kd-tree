import Tree from '../src/phtree';
import { scaleLinear, interpolateRgb, polygonHull } from 'd3';

const screenWidth  = document.documentElement.clientWidth;
const screenHeight = document.documentElement.clientHeight;

const pxRatio = window.devicePixelRatio;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.style.width  = screenWidth + 'px';
canvas.style.height = screenHeight + 'px';

  // global width/height to use for rendering, accunting for retina screens
const w = canvas.width = screenWidth * devicePixelRatio;
const h = canvas.height = screenHeight * devicePixelRatio;

const N = 500;

// const points = new Array(N).fill(0).map(() => {
//   return {
//     x: Math.random() * w,
//     y: Math.random() * h
//   };
// });
const cells = Math.sqrt(N) | 0;
let x = w / cells / 2, y = -h / cells / 2;
const points = new Array(N).fill(0).map((_, i) => {
  if (i % cells === 0) {
    y += h / cells;
    x = w / cells / 2;
  }
  const pt = { x, y };
  x += w / cells;
  return pt;
});


const tree = window.tree = new Tree(points);
const leftColor = scaleLinear().domain([0, Math.floor(N / 2)])
      .interpolate(interpolateRgb)
      .range(['orange', 'red']);

const rightColor = scaleLinear().domain([Math.floor(N / 2), N])
      .interpolate(interpolateRgb)
      .range(['gray', 'blue']);


function getPoints(subtree) {
  const list = [];
  const q = [subtree];
  while (q.length !== 0) {
    const next = q.pop();
    if (next) {
      list.push(next.point);
      if (next.left)  list.push(next.left.point);
      if (next.right) list.push(next.right.point);
      q.push(next.left, next.right);
    }
  }
  return list;
}


function getBBox(node) {
  if (node) {
    const points = [node.point].concat(getPoints(node.left)).concat(getPoints(node.right));
    return points.reduce((acc, { x, y }) => {
      acc[0] = Math.min(x, acc[0]);
      acc[1] = Math.min(y, acc[1]);
      acc[2] = Math.max(x, acc[2]);
      acc[3] = Math.max(y, acc[3]);
      return acc;
    }, [Infinity, Infinity, -Infinity, -Infinity ]);
  } else return null;
}

const query = [0,0,0,0];
const found = [];

canvas.addEventListener('mousemove', ({ x, y }) => {
  x *= pxRatio;
  y *= pxRatio;
  found.length = 0;
  query[0] = x - 50;
  query[1] = y - 50;
  query[2] = x + 50;
  query[3] = y + 50;

  found.push.apply(found, tree.query(query[0], query[1], query[2], query[3]));
  requestAnimationFrame(render);
});

const r = 5;
function render() {
  ctx.clearRect(0, 0, w, h);

  ctx.globalAlpha = 0.2;
  const Q = [tree._root];
  const mid = tree._root.code;
  // while (Q.length !== 0) {
  //   const node = Q.pop();
  //   if (node) {
  //     const pts = getPoints(node);
  //     const hull = polygonHull(pts.map(({x,y}) => [x, y]));
  //     if (hull) {
  //       ctx.beginPath();
  //       ctx.fillStyle = node.code < mid ? 'blue' : 'orange';
  //       // (!node.parent || node.parent.left === node) ? 'blue' : 'orange';
  //       ctx.moveTo(hull[0][0], hull[0][1]);
  //       for (let i = 1; i < hull.length; i++) {
  //         const hp = hull[i];
  //         ctx.lineTo(hp[0], hp[1]);
  //       }
  //       ctx.lineTo(hull[0][0], hull[0][1]);
  //       ctx.closePath();
  //       ctx.fill();
  //     }
  //     Q.unshift(node.left, node.right);
  //   }
  // }
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'orange';
  ctx.beginPath();
  points.forEach(({ x, y }) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  })
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'red';
  ctx.beginPath();
  [tree._root.point].forEach(({ x, y }) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  })
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const ll = getPoints(tree._root.left);
  const rr = getPoints(tree._root.left);

  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ll.forEach(({ x, y }) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  })
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'blue';
  ctx.beginPath();
  rr.forEach(({ x, y }) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  })
  ctx.closePath();
  ctx.fill();
  ctx.stroke();


  ctx.beginPath();
  let node = tree._list;
  while (node) {
    const bbox = node.bbox = getBBox(node);
    if (bbox) {
      ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
    }
    node = node.next;
  }
  ctx.closePath();
  ctx.stroke();


  ctx.beginPath();
  node = tree._list;
  while (node) {
    const bbox = node.bbox;
    if (bbox) {
      //ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
    }
    node = node.next;
  }
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.rect(query[0], query[1], query[2] - query[0], query[3] - query[1]);
  ctx.stroke();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;


  ctx.fillStyle = 'red';
  ctx.beginPath();
  found.forEach(({ x, y }) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, 2 * r, 0, 2 * Math.PI, false);
  })
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

render();
