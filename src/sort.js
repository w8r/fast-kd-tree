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

function quickSort(array, codes, left, right) {
  if (left < right) {
    const p = partition(array, codes, left, right);
    quickSort(array, codes, left, p);
    quickSort(array, codes, p + 1, right);
  }
  return array;
}


function qsort(data, values, left, right) {
  if (left >= right) return;

  const pivot = values[(left + right) >> 1];
  let i = left - 1;
  let j = right + 1;

  while (true) {
      do i++; while (values[i] < pivot);
      do j--; while (values[j] > pivot);
      if (i >= j) break;
      swap(data, values, i, j);
  }

  qsort(data, values, left, j);
  qsort(data, values, j + 1, right);
}

export default function sort (coords, codes) {
  return qsort(coords, codes, 0, coords.length - 1);
}
