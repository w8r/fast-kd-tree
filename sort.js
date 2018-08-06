function partition(array, order, left, right) {
  var cmp = order[array[right - 1]],
      minEnd = left,
      maxEnd;
  for (maxEnd = left; maxEnd < right - 1; maxEnd++) {
    if (order[array[maxEnd]] <= cmp) {
      swap(array, maxEnd, minEnd);
      minEnd ++;
    }
  }
  swap(array, minEnd, right - 1);
  return minEnd;
}

function swap(array, i, j) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
  return array;
}

function quickSort(array, order, left, right) {
  if (left < right) {
    const p = partition(array, order, left, right);
    quickSort(array, order, left, p);
    quickSort(array, order, p + 1, right);
  }
  return array;
}

export default function sort (array, order) {
  return quickSort(array, order, 0, array.length);
}
