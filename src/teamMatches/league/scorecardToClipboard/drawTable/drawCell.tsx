import { Size } from "../../../../commonTypes";
import { drawCentered } from "../helpers/drawCentered";
import { drawCellBorder } from "./drawCellBorder";

export interface FontInstruction {
  canvasFont: string;
  height: number;
  textMetrics: TextMetrics;
  text: string;
}

export type CustomDraw = (
  ctx: CanvasRenderingContext2D,
  text: string,
  cellWidth: number,
  y: number,
) => void;

export function drawCell(
  ctx: CanvasRenderingContext2D,
  gridLineColor: string,
  fontInstruction: FontInstruction,
  cellSize: Size,
  penColorOrCustomDraw: string | CustomDraw,
): number {
  drawCellBorder(ctx, gridLineColor, cellSize);

  ctx.font = fontInstruction.canvasFont;
  const diffFromMaxHeight = cellSize.height - fontInstruction.height;
  const y =
    fontInstruction.height +
    diffFromMaxHeight / 2 -
    fontInstruction.textMetrics.actualBoundingBoxDescent;
  if (penColorOrCustomDraw instanceof Function) {
    penColorOrCustomDraw(ctx, fontInstruction.text, cellSize.width, y);
  } else {
    drawCentered(
      ctx,
      fontInstruction.text,
      penColorOrCustomDraw,
      cellSize.width,
      y,
    );
  }

  ctx.translate(cellSize.width, 0);
  return cellSize.height;
}
