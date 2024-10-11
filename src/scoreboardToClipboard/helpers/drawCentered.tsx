export function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  fillStyle: string,
  width: number,
  y: number,
) {
  ctx.textAlign = "center";
  ctx.fillStyle = fillStyle;

  ctx.fillText(text, width / 2, y);
}
