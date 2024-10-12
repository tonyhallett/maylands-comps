export function memoize<T>(factory: (key: string) => T) {
  const cache: Record<string, T> = {};
  return function (key: string) {
    if (!(key in cache)) {
      cache[key] = factory(key);
    }
    return cache[key];
  };
}

export const colorToRGB = (function () {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d")!;

  return memoize(function (col) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  });
})();
