import morton from 'morton';

export default class bst {

  constructor (data, getX = d => d.x, getY = d => d.y) {
    for (let i = 0; i < data.length; i++) {
      const key = morton(getX(data), getY(data));
      this.insert(key, data);
    }
  }
  
}