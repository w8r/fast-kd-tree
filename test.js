import KDTree, { quicksort } from './';

describe('sorting', ()=> {
  const t = new Array(10).fill(0).map(() => (Math.random() * 100) | 0);
  console.log(t, quicksort(t.map((_, i) => i), t.slice()).map(k => t[k]));

});

describe('fast kd-tree', () => {

  it ('build from a set of points', () => {

  });


  it ('should be balanced', () => {

  });


  it ('traverse', () => {

  });
});
