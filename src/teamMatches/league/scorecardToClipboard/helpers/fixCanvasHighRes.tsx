export function fixCanvasHighRes(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  const dpr = window.devicePixelRatio;

  const baseWidth = canvas.width;
  const baseHeight = canvas.height;
  // Set the "actual" size of the canvas
  canvas.width = baseWidth * dpr;
  canvas.height = baseHeight * dpr;

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr);

  // Set the "drawn" size of the canvas
  canvas.style.width = `${baseWidth}px`;
  canvas.style.height = `${baseHeight}px`;
}
