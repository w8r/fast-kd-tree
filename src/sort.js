function qsort(data, values, left, right) {
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

export default function sort (coords, codes) {
  return qsort(coords, codes, 0, coords.length - 1);
}
