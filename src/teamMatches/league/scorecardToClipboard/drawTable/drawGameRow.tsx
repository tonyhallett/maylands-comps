import { Cell, Game, GameConfig } from ".";
import { PenColors } from "../generateScorecard";
import { getWinnersSurnameInstruction } from "./getWinnersSurnameInstruction";
import { getOrderOfPlayInstruction } from "./getOrderOfPlayInstruction";
import { getGameScoreInstructions } from "./getGameScoreInstructions";
import { drawGameRowCells } from "./drawGameRowCells";

export type RowCell = Omit<Cell, "header">;
export const gameScoreSeparator = "/";

export function drawGameRow(
  game: Game,
  ctx: CanvasRenderingContext2D,
  padding: number,
  penColors: PenColors,
  orderOfPlay: RowCell,
  gameConfig: GameConfig,
  winnersSurname: RowCell,
  fontFamily: string,
  isDoubles: boolean,
  gameSeparatorWidth: number,
) {
  const rowInstructions = [
    getOrderOfPlayInstruction(
      game,
      ctx,
      penColors,
      orderOfPlay,
      fontFamily,
      isDoubles,
    ),
    ...getGameScoreInstructions(
      game,
      ctx,
      penColors,
      gameConfig,
      fontFamily,
      gameSeparatorWidth,
    ),
    getWinnersSurnameInstruction(game, ctx, winnersSurname, fontFamily),
  ];

  return drawGameRowCells(rowInstructions, padding, penColors, ctx);
}
