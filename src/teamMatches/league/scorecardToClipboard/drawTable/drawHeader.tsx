import { PenColors } from "../generateScorecard";
import { drawCell } from "./drawCell";
import { Cell } from ".";
import { getInstructions } from "./getInstructions";

export type HeaderCell = Omit<Cell, "row">;

export function drawHeader(
  ctx: CanvasRenderingContext2D,
  padding: number,
  penColors: PenColors,
  orderOfPlay: HeaderCell,
  game: HeaderCell,
  winnersSurname: HeaderCell,
  fontFamily: string,
) {
  const headerInstructions = [
    getInstructions(
      ctx,
      "Order of Play",
      orderOfPlay.header,
      fontFamily,
      orderOfPlay.width,
      false,
    ),
    ...["1st", "2nd", "3rd", "4th", "5th"].map((header) =>
      getInstructions(ctx, header, game.header, fontFamily, game.width, false),
    ),
    getInstructions(
      ctx,
      "Winners Surname",
      winnersSurname.header,
      fontFamily,
      winnersSurname.width,
      false,
    ),
  ];
  const maxHeight = Math.max(...headerInstructions.map((m) => m.height));
  const cellHeight = maxHeight + padding * 2;
  let shift = 0;
  headerInstructions.forEach((cellInstruction) => {
    shift = drawCell(
      ctx,
      penColors.title,
      cellInstruction,
      {
        height: cellHeight,
        width: cellInstruction.cellWidth,
      },
      penColors.title,
    );
  });
  return shift;
}
