import { drawBackgroundColor } from "./helpers/drawBackgroundColor";
import { drawResultWon } from "./drawResultWon";
import { Game, TableConfig, drawTable } from "./drawTable";
import { Team, drawTeam } from "./drawTeam";
import { drawTitleAndDate } from "./drawTitleAndDate";
import { fixCanvasHighRes } from "./helpers/fixCanvasHighRes";
import { drawSignature } from "./drawSignature";

export interface FontFormat {
  size: number;
  isBold: boolean;
}

export interface TitleEntryFontFormat {
  title: FontFormat;
  entry: FontFormat;
}

export interface PenColors {
  title: string;
  entry: string;
}

interface XPositioned {
  x: number;
}

export interface LeagueAndDate {
  paddingTopBottom: number;
  league: FontFormat & XPositioned;
  date: TitleEntryFontFormat & XPositioned;
}

export type Signature = HTMLImageElement; // Parameters<CanvasRenderingContext2D["drawImage"]>[0];

export interface ScorecardConfig {
  fontFamily: string; // todo - loading, also one for entry and one for title - perhaps handwriting
  penColors: PenColors;
  backgroundColor: string;
  leagueAndDate: LeagueAndDate;
  //font
  fontFomat: {
    homeTeam: TitleEntryFontFormat;
    awayTeam: TitleEntryFontFormat;
    players: TitleEntryFontFormat;
  };
  table: TableConfig;
  result: TitleEntryFontFormat;
  won: TitleEntryFontFormat;
  signatureTitle: FontFormat;
}

export function generateScorecard(
  config: ScorecardConfig,
  date: Date,
  homeTeam: Team,
  awayTeam: Team,
  games: Game[],
  result: string,
  won: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  homeSignature: Signature,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  awaySignature?: Signature,
) {
  const tableConfig = config.table;
  // currently 696
  const canvasWidth =
    tableConfig.orderOfPlay.width +
    tableConfig.game.width * 5 +
    tableConfig.winnersSurname.width;

  // canvas height tbd
  const canvas = document.createElement("canvas");
  // the canvas dimensions need to be determined in advance
  // can you make large then scale down or trim the canvas?
  canvas.width = canvasWidth + 50; ///////////////////////////////////////////// TODO !
  canvas.height = 600;

  const ctx = canvas.getContext("2d")!;

  fixCanvasHighRes(canvas, ctx);
  drawBackgroundColor(canvas, ctx, config.backgroundColor);

  ctx.translate(10, 0); //todo expose

  drawTitleAndDate(
    ctx,
    config.penColors,
    date,
    config.leagueAndDate,
    config.fontFamily,
  );

  drawTeam(
    ctx,
    homeTeam,
    true,
    config.penColors,
    config.fontFomat.homeTeam,
    config.fontFomat.players,
    config.fontFamily,
    canvasWidth,
  );

  drawTeam(
    ctx,
    awayTeam,
    false,
    config.penColors,
    config.fontFomat.awayTeam,
    config.fontFomat.players,
    config.fontFamily,
    canvasWidth,
  );

  drawTable(ctx, config.penColors, tableConfig, games, config.fontFamily);

  drawResultWon(
    ctx,
    result,
    won,
    config.penColors,
    config.result,
    config.won,
    config.fontFamily,
    canvasWidth,
  );

  drawSignature(
    ctx,
    config.signatureTitle,
    config.fontFamily,
    config.penColors.title,
    canvasWidth,
    homeSignature,
    awaySignature,
  );
  return canvas;
}
