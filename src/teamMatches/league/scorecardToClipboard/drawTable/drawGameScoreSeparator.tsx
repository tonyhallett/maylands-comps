import { drawCentered } from "../helpers/drawCentered";
import { gameScoreSeparator } from "./drawGameRow";

export const drawGameScoreSeparator = (
  ctx: CanvasRenderingContext2D,
  cellWidth: number,
  y: number,
  titleColor: string,
) => {
  drawCentered(ctx, gameScoreSeparator, titleColor, cellWidth, y);
};
