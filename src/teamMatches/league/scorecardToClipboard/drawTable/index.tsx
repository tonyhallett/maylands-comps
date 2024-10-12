import { FontFormat, PenColors } from "../generateScorecard";
import { measureTexts } from "../helpers/measureTexts";
import { saveRestore } from "../helpers/saveRestore";
import { drawGameRow, gameScoreSeparator } from "./drawGameRow";
import { drawHeader } from "./drawHeader";

export interface GameConfig extends Cell {
  gamePointsPadding: number;
}

export interface TableConfig {
  paddingTopBottom: number;
  orderOfPlay: Cell;
  game: GameConfig;
  winnersSurname: Cell;
  marginBottom: number;
}

export interface Cell {
  width: number; // will center the text within
  header: FontFormat;
  row: FontFormat;
}

export interface Score {
  home: number;
  away: number;
}

export interface Game {
  orderOfPlay: string;
  scores: Score[];
  winnersSurname: string;
}

export function drawTable(
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  config: TableConfig,
  games: Game[],
  fontFamily: string,
) {
  const shift = saveRestore(ctx, () => {
    return drawHeader(
      ctx,
      config.paddingTopBottom,
      penColors,
      config.orderOfPlay,
      config.game,
      config.winnersSurname,
      fontFamily,
    );
  });
  ctx.translate(0, shift);

  const gameSeparatorWidth = measureTexts(
    ctx,
    config.game.row,
    fontFamily,
    gameScoreSeparator,
  ).metrics[0].width;

  for (let i = 0; i < games.length; i++) {
    const shift = saveRestore(ctx, () => {
      return drawGameRow(
        games[i],
        ctx,
        config.paddingTopBottom,
        penColors,
        config.orderOfPlay,
        config.game,
        config.winnersSurname,
        fontFamily,
        i === 9,
        gameSeparatorWidth,
      );
    });
    ctx.translate(0, shift);
  }
}
