export function propSame<T>(array: T[], prop: keyof T): boolean {
  if (array.length === 0) {
    return true;
  }
  const first = array[0][prop];
  return array.every((item) => item[prop] === first);
}
