export function isNotUndefined<T>(t: T | undefined): t is T {
  return t !== undefined;
}
export function isNotNull<T>(t: T | null): t is T {
  return t !== null;
}
