import { drawCentered } from "../helpers/drawCentered";
import { getScorecardCanvasFont } from "../helpers/getCanvasFont";
import { CellInstruction, getInstructions } from "./getInstructions";
import { Game } from ".";
import { FontFormat, PenColors } from "../generateScorecard";
import { RowCell } from "./drawGameRow";

export function getOrderOfPlayInstruction(
  game: Game,
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  orderOfPlay: RowCell,
  fontFamily: string,
  isDoubles: boolean,
): CellInstruction {
  const drawDoublesOrderOfPlayEntry = (
    ctx: CanvasRenderingContext2D,
    cellWidth: number,
    y: number,
  ) => {
    const entryText = game.orderOfPlay.replace("V", "  ");
    const entryFormat: FontFormat = {
      ...orderOfPlay.row,
      isBold: false,
    };
    ctx.font = getScorecardCanvasFont(entryFormat, fontFamily);
    drawCentered(ctx, entryText, penColors.entry, cellWidth, y);
  };

  const drawDoublesV = (
    ctx: CanvasRenderingContext2D,
    cellWidth: number,
    y: number,
  ) => {
    drawCentered(ctx, "V", penColors.title, cellWidth, y);
  };

  return isDoubles
    ? getInstructions(
        ctx,
        game.orderOfPlay,
        orderOfPlay.row,
        fontFamily,
        orderOfPlay.width,
        (ctx, text, cellWidth, y) => {
          drawDoublesV(ctx, cellWidth, y);
          drawDoublesOrderOfPlayEntry(ctx, cellWidth, y);
        },
      )
    : getInstructions(
        ctx,
        game.orderOfPlay,
        orderOfPlay.row,
        fontFamily,
        orderOfPlay.width,
        false,
      );
}
