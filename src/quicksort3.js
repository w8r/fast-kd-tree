function _quickSort (items, codes, left, right) {
  if (items.length > 1) {
    /*
     * Partition array using Dijkstra Dutch Flag algorithm:
     *
     * [lo, lt - 1] - elements lower than pivot
     * [lt, i - 1] - elements equal to pivot
     * [i, gt] - unchecked elements
     * [gt + 1, hi] - elements greater than pivot
     */
    const pivot = codes[left];
    let lt = left, gt = right, m, n, temp;

    for (let i = left; i <= gt;) {
      if (codes[i] < pivot)      {
        m = lt++; n = i++;

        temp     = items[m];
        items[m] = items[n];
        items[n] = temp;

        temp     = codes[m];
        codes[m] = codes[n];
        codes[n] = temp;
      } else if (codes[i] > pivot) {
        m = gt--; n = i;
        temp = items[m];
        items[m] = items[n];
        items[n] = temp;

        temp     = codes[m];
        codes[m] = codes[n];
        codes[n] = temp;
      }
      else i++;
    }
    lt = lt - 1;
    gt = gt + 1;

    if (left < lt)  _quickSort(items, codes, left, lt);
    if (gt < right) _quickSort(items, codes, gt, right);
  }

  return items;
}

export default function quickSort3Way (a, b) {
  return _quickSort(a, b, 0, a.length - 1);
}
