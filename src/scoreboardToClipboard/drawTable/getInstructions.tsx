import { FontFormat } from "../generateScorecard";
import { measureTexts } from "../helpers/measureTexts";
import { CustomDraw, FontInstruction } from "./drawCell";

export interface CellInstruction extends FontInstruction {
  customDraw: CustomDraw | undefined;
  cellWidth: number;
  isEntry: boolean | undefined;
}

export function getInstructions(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFormat: FontFormat,
  fontFamily: string,
  cellWidth: number,
  isEntry: boolean,
): CellInstruction;
export function getInstructions(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFormat: FontFormat,
  fontFamily: string,
  cellWidth: number,
  customDraw: CustomDraw,
): CellInstruction;
export function getInstructions(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFormat: FontFormat,
  fontFamily: string,
  cellWidth: number,
  isEntryOrCustomDraw: boolean | CustomDraw,
): CellInstruction {
  const { canvasFont, metrics } = measureTexts(
    ctx,
    fontFormat,
    fontFamily,
    text,
  );
  ctx.font = canvasFont;
  const textMetrics = metrics[0];
  const height =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

  const isCustomDraw = isEntryOrCustomDraw instanceof Function;
  const cellInstruction: CellInstruction = {
    height,
    textMetrics,
    text,
    cellWidth,
    canvasFont,
    isEntry: isCustomDraw ? undefined : isEntryOrCustomDraw,
    customDraw: isCustomDraw ? isEntryOrCustomDraw : undefined,
  };
  return cellInstruction;
}
