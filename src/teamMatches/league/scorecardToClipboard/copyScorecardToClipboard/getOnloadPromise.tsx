export function getOnloadPromise(img: HTMLImageElement) {
  return new Promise((resolve) => {
    img.onload = resolve;
  });
}
