export function fillArray<T>(
  numItems: number,
  valueProvider: (index: number) => T,
): T[] {
  return new Array(numItems).fill(0).map((_, i) => valueProvider(i));
}

export function fillArrayWithIndices(numItems: number) {
  return fillArray(numItems, (i) => i);
}
