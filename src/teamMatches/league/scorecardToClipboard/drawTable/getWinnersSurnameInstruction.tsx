import { CellInstruction, getInstructions } from "./getInstructions";
import { Game } from ".";
import { RowCell } from "./drawGameRow";

export function getWinnersSurnameInstruction(
  game: Game,
  ctx: CanvasRenderingContext2D,
  winnersSurname: RowCell,
  fontFamily: string,
): CellInstruction {
  // could end up having different heights based on the surname *********************************
  return getInstructions(
    ctx,
    game.winnersSurname,
    winnersSurname.row,
    fontFamily,
    winnersSurname.width,
    true,
  );
}
