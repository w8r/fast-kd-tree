function partition(array, codes, left, right) {
  var cmp = codes[right - 1],
      minEnd = left,
      maxEnd;
  for (maxEnd = left; maxEnd < right - 1; maxEnd++) {
    if (codes[maxEnd] <= cmp) {
      swap(array, codes, maxEnd, minEnd);
      minEnd++;
    }
  }
  swap(array, codes, minEnd, right - 1);
  return minEnd;
}

function swap(array, codes, i, j) {
  const temp = array[i];
  array[i]   = array[j];
  array[j]   = temp;

  const code = codes[i];
  codes[i]   = codes[j];
  codes[j]   = code;
}

export default function quickSort(array, codes, left, right) {
  if (left < right) {
    const p = partition(array, codes, left, right);
    quickSort(array, codes, left, p);
    quickSort(array, codes, p + 1, right);
  }
  return array;
}
