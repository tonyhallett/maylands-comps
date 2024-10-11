import { drawCentered } from "../helpers/drawCentered";
import { FontFormat, PenColors } from "../generateScorecard";
import { getScorecardCanvasFont } from "../helpers/getCanvasFont";
import { measureTexts } from "../helpers/measureTexts";
import { drawCell } from "./drawCell";
import { getInstructions } from "./getInstructions";
import { Cell, Game } from ".";

export type RowCell = Omit<Cell, "header">;
export const gameScoreSeparator = "/";

export function drawGameRow(
  game: Game,
  ctx: CanvasRenderingContext2D,
  padding: number,
  penColors: PenColors,
  orderOfPlay: RowCell,
  gameCell: RowCell,
  winnersSurname: RowCell,
  gridLineSize: number,
  fontFamily: string,
  isDoubles: boolean,
) {
  ctx.save();
  // don't want to keep doing this everytime
  const gameSeparatorWidth = measureTexts(
    ctx,
    gameCell.row,
    fontFamily,
    gameScoreSeparator,
  ).metrics[0].width;
  const gamePointsPadding = 5;
  const gameScoreInstructions = game.scores.map((score) => {
    const homeWidth = measureTexts(
      ctx,
      gameCell.row,
      fontFamily,
      score.home.toString(),
    ).metrics[0].width;

    return getInstructions(
      ctx,
      `${score.home} ${gameScoreSeparator} ${score.away}`,
      gameCell.row,
      fontFamily,
      gameCell.width,
      (ctx, text, cellWidth, y) => {
        ctx.fillStyle = penColors.title;
        drawCentered(ctx, gameScoreSeparator, penColors.title, cellWidth, y);
        const homeX =
          cellWidth / 2 -
          gameSeparatorWidth / 2 -
          homeWidth -
          gamePointsPadding;
        ctx.textAlign = "left";
        ctx.fillStyle = penColors.entry;
        ctx.fillText(score.home.toString(), homeX, y);

        const awayX =
          cellWidth / 2 + gameSeparatorWidth / 2 + gamePointsPadding;
        ctx.fillText(score.away.toString(), awayX, y);
      },
    );
  });
  if (game.scores.length < 5) {
    const diff = 5 - game.scores.length;
    for (let i = 0; i < diff; i++) {
      gameScoreInstructions.push(
        getInstructions(
          ctx,
          gameScoreSeparator,
          gameCell.row,
          fontFamily,
          gameCell.width,
          false,
        ),
      );
    }
  }
  const rowInstructions = [
    isDoubles
      ? getInstructions(
          ctx,
          game.orderOfPlay,
          orderOfPlay.row,
          fontFamily,
          orderOfPlay.width,
          (ctx, text, cellWidth, y) => {
            drawCentered(ctx, "V", penColors.title, cellWidth, y);
            const entryText = game.orderOfPlay.replace("V", "  ");
            const entryFormat: FontFormat = {
              ...orderOfPlay.row,
              isBold: false,
            };
            ctx.font = getScorecardCanvasFont(entryFormat, fontFamily);
            drawCentered(ctx, entryText, penColors.entry, cellWidth, y);
          },
        )
      : getInstructions(
          ctx,
          game.orderOfPlay,
          orderOfPlay.row,
          fontFamily,
          orderOfPlay.width,
          false,
        ),
    ...gameScoreInstructions,
    // could end up having different heights based on the surname *********************************
    getInstructions(
      ctx,
      game.winnersSurname,
      winnersSurname.row,
      fontFamily,
      winnersSurname.width,
      true,
    ),
  ];
  const maxHeight = Math.max(...rowInstructions.map((m) => m.height));
  const cellHeight = maxHeight + padding * 2;
  let shift = 0;
  rowInstructions.forEach((cellInstruction) => {
    if (cellInstruction.isEntry !== undefined) {
      shift = drawCell(
        ctx,
        {
          gridLineSize,
          gridLineColor: penColors.title,
        },

        cellInstruction,
        {
          height: cellHeight,
          width: cellInstruction.cellWidth,
        },

        cellInstruction.isEntry ? penColors.entry : penColors.title,
      );
    } else {
      shift = drawCell(
        ctx,
        {
          gridLineSize,
          gridLineColor: penColors.title,
        },

        cellInstruction,
        {
          height: cellHeight,
          width: cellInstruction.cellWidth,
        },

        cellInstruction.customDraw!,
      );
    }
  });
  ctx.restore();
  ctx.translate(0, shift);
}
