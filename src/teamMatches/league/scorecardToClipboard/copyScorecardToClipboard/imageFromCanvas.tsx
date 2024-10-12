export function imageFromCanvas(canvas: HTMLCanvasElement) {
  const img = new Image(canvas.width, canvas.height);
  img.src = canvas.toDataURL();
  return img;
}
