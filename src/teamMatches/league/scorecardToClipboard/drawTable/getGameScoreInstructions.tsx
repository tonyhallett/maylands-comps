import { measureTexts } from "../helpers/measureTexts";
import { getInstructions } from "./getInstructions";
import { Game, GameConfig } from ".";
import { PenColors } from "../generateScorecard";
import { gameScoreSeparator } from "./drawGameRow";
import { drawGameScoreSeparator } from "./drawGameScoreSeparator";
import { drawScores } from "./drawScores";

export function getGameScoreInstructions(
  game: Game,
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  gameConfig: GameConfig,
  fontFamily: string,
  gameSeparatorWidth: number,
) {
  const gameScoreInstructions = game.scores.map((score) => {
    const homeWidth = measureTexts(
      ctx,
      gameConfig.row,
      fontFamily,
      score.home.toString(),
    ).metrics[0].width;

    return getInstructions(
      ctx,
      `${score.home} ${gameScoreSeparator} ${score.away}`,
      gameConfig.row,
      fontFamily,
      gameConfig.width,
      (ctx, text, cellWidth, y) => {
        drawGameScoreSeparator(ctx, cellWidth, y, penColors.title);
        drawScores(
          ctx,
          gameSeparatorWidth,
          gameConfig.gamePointsPadding,
          cellWidth,
          y,
          homeWidth,
          score,
          penColors.entry,
        );
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
          gameConfig.row,
          fontFamily,
          gameConfig.width,
          false,
        ),
      );
    }
  }
  return gameScoreInstructions;
}
