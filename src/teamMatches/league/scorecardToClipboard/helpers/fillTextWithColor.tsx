export function fillTextWithColor(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string,
  maxWidth?: number,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
}
