

export default class Quadtreap {

  constructor (data, getX = d => d.x, getY = d => d.y) {
    this._root = null;

    this._x = getX;
    this._y = getY;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      this.insert(getX(d) , getY(d), data[i]);
    }
  }


  insert (x, y, data) {

  }
}