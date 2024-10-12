import { drawBackgroundColor } from "./helpers/drawBackgroundColor";
import { drawResultWon } from "./drawResultWon";
import { Game, TableConfig, drawTable } from "./drawTable";
import { Team, drawTeam } from "./drawTeam";
import { drawLeagueAndDate } from "./drawLeagueAndDate";
import { fixCanvasHighRes } from "./helpers/fixCanvasHighRes";
import { drawSignature, getMaxHeight } from "./drawSignature";
import { saveRestore } from "./helpers/saveRestore";

export interface FontFormat {
  size: number;
  isBold: boolean;
}

export interface TitleEntryFontFormat {
  title: FontFormat;
  entry: FontFormat;
  titleMarginRight: number;
}

export interface PenColors {
  title: string;
  entry: string;
}

interface XPositioned {
  x: number;
}

export interface LeagueAndDate {
  marginBottom: number;
  league: FontFormat & XPositioned;
  date: TitleEntryFontFormat & XPositioned;
}

export type Signature = HTMLImageElement | null;
export interface TeamConfig extends TitleEntryFontFormat {
  titleEntryMarginBottom: number;
  marginBottom: number;
}

interface RestrictedTitleEntryFormat extends TitleEntryFontFormat {
  entryMarginRight: number;
}

export interface ResultWonConfig {
  result: RestrictedTitleEntryFormat;
  won: TitleEntryFontFormat;
  marginBottom: number;
}

export interface SignatureConfig {
  title: FontFormat;
  titleMarginRight: number;
}

export type PlayerConfig = RestrictedTitleEntryFormat;

export interface ScorecardConfig {
  fontFamily: string; // todo - loading, also one for entry and one for title - perhaps handwriting
  penColors: PenColors;
  backgroundColor: string;
  paddingTop: number;
  paddingLeftRight: number;
  // todo should be calculated
  heightWithoutSignatures: number;
  leagueAndDate: LeagueAndDate;
  teams: {
    homeTeam: TeamConfig;
    awayTeam: TeamConfig;
    players: PlayerConfig;
  };
  table: TableConfig;
  resultWon: ResultWonConfig;
  signature: SignatureConfig;
}

function getTableWidth(tableConfig: TableConfig) {
  return (
    tableConfig.orderOfPlay.width +
    tableConfig.winnersSurname.width +
    tableConfig.game.width * 5
  );
}

export function generateScorecard(
  config: ScorecardConfig,
  date: Date,
  homeTeam: Team,
  awayTeam: Team,
  games: Game[],
  result: string,
  won: string,
  homeSignature: Signature,
  awaySignature: Signature,
) {
  const tableConfig = config.table;

  const canvas = document.createElement("canvas");
  const tableWidth = getTableWidth(tableConfig);
  canvas.width = tableWidth + 2 * config.paddingLeftRight;
  // should be calculated in advance
  canvas.height =
    config.heightWithoutSignatures + getMaxHeight(homeSignature, awaySignature);

  const ctx = canvas.getContext("2d")!;

  fixCanvasHighRes(canvas, ctx);

  drawBackgroundColor(canvas, ctx, config.backgroundColor);

  ctx.translate(config.paddingLeftRight, config.paddingTop); //todo expose
  let shift = drawLeagueAndDate(
    ctx,
    config.penColors,
    date,
    config.leagueAndDate,
    config.fontFamily,
  );
  ctx.translate(0, shift + config.leagueAndDate.marginBottom);

  shift = drawTeam(
    ctx,
    homeTeam,
    true,
    config.penColors,
    config.teams.homeTeam,
    config.teams.players,
    config.fontFamily,
    tableWidth,
  );
  ctx.translate(0, shift + config.teams.homeTeam.marginBottom);

  shift = drawTeam(
    ctx,
    awayTeam,
    false,
    config.penColors,
    config.teams.awayTeam,
    config.teams.players,
    config.fontFamily,
    tableWidth,
  );
  ctx.translate(0, shift + config.teams.awayTeam.marginBottom);

  drawTable(ctx, config.penColors, tableConfig, games, config.fontFamily);
  ctx.translate(0, tableConfig.marginBottom);

  shift = saveRestore(ctx, () => {
    return drawResultWon(
      ctx,
      result,
      won,
      config.penColors,
      config.resultWon,
      config.fontFamily,
      tableWidth,
    );
  });
  ctx.translate(0, shift);

  drawSignature(
    ctx,
    config.signature,
    config.fontFamily,
    config.penColors.title,
    tableWidth,
    homeSignature,
    awaySignature,
  );
  return canvas;
}
