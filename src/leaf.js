export class Leaf {
  constructor (code, data) {
    this.code = code;
    this.data = data;

    // this.x0 = this.x1 = data[0];
    // this.y0 = this.y1 = data[1];
  }
}


export class BucketLeaf {

  constructor (code, data) {
    this.code = code;
    this.data = data;
    
    // this.x0 = data.x1 = data[0];
    // this.y0 = data.y1 = data[1];
  }
}
