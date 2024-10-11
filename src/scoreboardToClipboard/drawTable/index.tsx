import { FontFormat, PenColors } from "../generateScorecard";
import { drawGameRow } from "./drawGameRow";
import { drawHeader } from "./drawHeader";

export interface TableConfig {
  paddingTopBottom: number;
  orderOfPlay: Cell;
  game: Cell;
  winnersSurname: Cell;
  gridLineSize: number;
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
  ctx.translate(config.gridLineSize / 2, config.gridLineSize);
  drawHeader(
    ctx,
    config.paddingTopBottom,
    penColors,
    config.orderOfPlay,
    config.game,
    config.winnersSurname,
    config.gridLineSize,
    fontFamily,
  );
  for (let i = 0; i < games.length; i++) {
    drawGameRow(
      games[i],
      ctx,
      config.paddingTopBottom,
      penColors,
      config.orderOfPlay,
      config.game,
      config.winnersSurname,
      config.gridLineSize,
      fontFamily,
      i === 9,
    );
  }
}
