import { Size } from "../../commonTypes";
import { drawCentered } from "../helpers/drawCentered";
import { GridInstruction, drawCellBorder } from "./drawCellBorder";

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
  gridInstruction: GridInstruction,
  cellInstructions: FontInstruction,
  cellSize: Size,
  penColor: string,
): number;
export function drawCell(
  ctx: CanvasRenderingContext2D,
  gridInstruction: GridInstruction,
  cellInstructions: FontInstruction,
  cellSize: Size,
  customDraw: CustomDraw,
): number;
export function drawCell(
  ctx: CanvasRenderingContext2D,
  gridInstruction: GridInstruction,
  cellInstructions: FontInstruction,
  cellSize: Size,
  penColorOrCustomDraw: string | CustomDraw,
): number {
  drawCellBorder(ctx, gridInstruction, cellSize);

  ctx.font = cellInstructions.canvasFont;
  const diffFromMaxHeight = cellSize.height - cellInstructions.height;
  const y =
    cellInstructions.height +
    diffFromMaxHeight / 2 -
    cellInstructions.textMetrics.actualBoundingBoxDescent;
  if (penColorOrCustomDraw instanceof Function) {
    penColorOrCustomDraw(ctx, cellInstructions.text, cellSize.width, y);
  } else {
    drawCentered(
      ctx,
      cellInstructions.text,
      penColorOrCustomDraw,
      cellSize.width,
      y,
    );
  }

  ctx.translate(cellSize.width, 0);
  return cellSize.height + gridInstruction.gridLineSize;
}
