import { Size } from "../../../../commonTypes";

export interface GridInstruction {
  gridLineSize: number;
  gridLineColor: string;
}

export function drawCellBorder(
  ctx: CanvasRenderingContext2D,
  gridLineColor: string,
  cellSize: Size,
) {
  ctx.strokeStyle = gridLineColor;
  ctx.beginPath();
  ctx.strokeRect(0, 0, cellSize.width, cellSize.height);
}
