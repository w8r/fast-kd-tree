import morton from 'morton';

function qsort (data:Uint32Array|number[], values:number[] | Uint32Array, left:number, right:number) {
  if (left >= right) return;

  const pivot = values[(left + right) >> 1];
  let i = left - 1;
  let j = right + 1;
  let temp;

  while (true) {
    do i++; while (values[i] < pivot);
    do j--; while (values[j] > pivot);
    if (i >= j) break;

    // swap(data, values, i, j);
    temp      = data[i];
    data[i]   = data[j];
    data[j]   = temp;

    temp      = values[i];
    values[i] = values[j];
    values[j] = temp;
  }

  qsort(data, values, left, j);
  qsort(data, values, j + 1, right);
}

function sort (coords:number[] | Uint32Array, codes:number[] | Uint32Array) {
  return qsort(coords, codes, 0, coords.length - 1);
}


function __clz (m:number):number {
  let c:number = 1 << 31;
  for (let i:number = 0; i < 31; i += 1) {
    if (c & m) return i;
    c >>>= 1;
  }
  return 32;
}


function findSplit (codes:ArrayLike<Code>, first:number, last:number):number {
  const f:Code = codes[first];
  const l:Code = codes[last];

  if (f === l) return (first + last) >> 1;

  // Calculate the number of highest bits that are the same
  // for all objects, using the count-leading-zeros intrinsic.
  const commonPrefix:number = __clz(f ^ l);

  // Use binary search to find where the next bit differs.
  // Specifically, we are looking for the highest object that
  // shares more than commonPrefix bits with the first one.

  let split:number = first; // initial guess
  let step:number = last - first, newSplit, splitCode, splitPrefix;

  do {
    step = (step + 1) >> 1; // exponential decrease
    newSplit = split + step; // proposed new position

    if (newSplit < last) {
      splitCode = codes[newSplit];
      splitPrefix = __clz(f ^ splitCode);
      if (splitPrefix > commonPrefix) split = newSplit; // accept proposal
    }
  } while (step > 1)
  return split;
}


function build (data:Array<any>,
  ids:ArrayLike<number>, codes:ArrayLike<Code>, first:number, last:number) {
  if (last - first === 0) return new Leaf(codes[first], data[ids[first]]);
  const split:number = findSplit(codes, first, last);
  const left:Node  = build(data, ids, codes, first, split);
  const right:Node = build(data, ids, codes, split + 1, last);
  return new InternalNode(split, left, right);
}


function buildBuckets (data:Array<any>,
  ids:ArrayLike<number>, codes:ArrayLike<Code>,
  first:number, last:number, bucketSize:number) {
  if (last - first <= bucketSize) {
    const bucket = new Array(last - first + 1);
    for (let i = first, j = 0; i <= last; i++, j++) bucket[j] = data[ids[i]];
    return new BucketLeaf(codes[first], bucket);
  }
  const split = findSplit(codes, first, last);
  const left  = buildBuckets(data, ids, codes, first, split, bucketSize);
  const right = buildBuckets(data, ids, codes, split + 1, last, bucketSize);

  return new InternalNode(split, left, right);
}


function defaultGetY(data:any):number {
  return data.y;
}


function defaultGetX(data:any):number {
  return data.x;
}


export type Code = number;

interface Node {
  key:Code;
}

export class InternalNode implements Node {

  public key:Code;
  public left:Node;
  public right:Node;

  constructor (key:Code, left?:Node, right?:Node) {
    this.key   = key;
    this.left  = left;
    this.right = right;
  }
}

export class Leaf implements Node {

  public key:Code;
  public data:any;

  constructor (key:Code, data: any) {
    this.key  = key;
    this.data = data;
  }
}

export class BucketLeaf implements Node {

  public key:Code;
  public data:Array<any>;

  constructor (key:Code, data:Array<any>) {
    this.key = key;
    this.data = data;
  }
}

export type CoordinateGetter = (data:any) => number;

export default class Tree {

  private _x:CoordinateGetter;
  private _y:CoordinateGetter;

  public xmin:number;
  public ymin:number;
  public xmax:number;
  public ymax:number;

  private _nodeSize: number;

  private _root: Node;
  private _project: (x:number, y:number) => Code;

  constructor (data: Array<any>,
    getX:CoordinateGetter = defaultGetX,
    getY:CoordinateGetter = defaultGetY,
    nodeSize:number = 0) {
    const n:number  = data.length;
    const codes     = new Uint32Array(n);
    let minX:number = Infinity, minY:number = Infinity,
        maxX:number = -Infinity, maxY:number = -Infinity;
    let p:any, i:number, x:number, y:number;

    this._x = getX;
    this._y = getY;

    const project = morton;
    this._project = project;

    const ids = new Uint32Array(n);

    for (i = 0; i < n; i++) {
      p = data[i];
      x = getX(p);
      y = getY(p);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      ids[i] = i;
    }

    this.xmin = minX;
    this.ymin = minY;
    this.xmax = maxX;
    this.ymax = maxY;

    const max = (1 << 16) - 1;
    const w = max / (maxX - minX);
    const h = max / (maxY - minY);

    for (i = 0; i < n; i++) {
      p = data[i];
      codes[i] = project(w * (getX(p) - minX), h * (getY(p) - minY));
    }
    sort(ids, codes);

    if (nodeSize === 0) {
      this._root = build(data, ids, codes, 0, n - 1);
    } else {
      this._root = buildBuckets(data, ids, codes, 0, n - 1, nodeSize);
    }
    /** @type {Number} */
    this._nodeSize = nodeSize;
  }
}
