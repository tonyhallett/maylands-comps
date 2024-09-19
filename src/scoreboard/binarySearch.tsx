type Measurer = (size: number) => boolean;

export function binarySearch(
  measureFunc: Measurer,
  minSize: number,
  maxSize: number,
): number {
  while (minSize <= maxSize) {
    const midSize = Math.floor((minSize + maxSize) / 2);

    if (measureFunc(midSize)) {
      maxSize = midSize - 1;
    } else {
      minSize = midSize + 1;
    }
  }

  return maxSize;
}
