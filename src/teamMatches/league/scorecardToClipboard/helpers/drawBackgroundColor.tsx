export function drawBackgroundColor(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
