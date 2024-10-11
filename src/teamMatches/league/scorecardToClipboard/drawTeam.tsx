import { PenColors, TitleEntryFontFormat } from "./generateScorecard";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";
import { measureForLine } from "./helpers/measureForLine";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";

export interface Team {
  name: string;
  players: (string | undefined)[];
}

export const homeIdentifers = ["A", "B", "C"];
export const awayIdentifers = ["X", "Y", "Z"];

const getPlayer = (player: string | undefined) =>
  player === undefined ? "-----" : player;

function drawPlayers(
  ctx: CanvasRenderingContext2D,
  team: Team,
  isHome: boolean,
  penColors: PenColors,
  playersFormat: TitleEntryFontFormat,
  fontFamily: string,
  availableWidth: number,
) {
  const playerShare = availableWidth / 3;
  const playerIdentiferPadding = 10;
  const playerSharePadding = 10;
  const playersIdentifers = isHome ? homeIdentifers : awayIdentifers;

  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    ...[0, 1, 2].flatMap((i) => {
      return [
        {
          fontFormat: playersFormat.title,
          text: getSuffixedTitle(playersIdentifers[i]),
        },
        {
          fontFormat: playersFormat.entry,
          text: getPlayer(team.players[i]),
        },
      ];
    }),
  );
  ctx.save();

  for (let i = 0; i < 3; i++) {
    if (i !== 0) {
      ctx.translate(playerShare, 0);
    }
    const titleWidth = results[i * 2].metrics.width;
    const maxWidth =
      playerShare - titleWidth - playerIdentiferPadding - playerSharePadding;
    drawTitleAndEntry(
      ctx,
      penColors,
      {
        titleX: 0,
        titleWidth,
        y: maxAscent,
        padding: 5,
      },
      results[i * 2],
      { ...results[i * 2 + 1], maxWidth },
    );
  }
  ctx.restore();
  return maxAscent + maxDescent;
}

export function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: Team,
  isHome: boolean,
  penColors: PenColors,
  teamFormat: TitleEntryFontFormat,
  players: TitleEntryFontFormat,
  fontFamily: string,
  availableWidth: number,
) {
  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    {
      fontFormat: teamFormat.title,
      text: getSuffixedTitle(`${isHome ? "Home" : "Away"} Team`),
    },
    { fontFormat: teamFormat.entry, text: team.name },
  );
  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[0].metrics.width,
      y: maxAscent,
      padding: 5,
    },
    results[0],
    results[1],
  );

  const titlePaddingBottom = 10;

  ctx.translate(0, titlePaddingBottom + maxAscent + maxDescent);

  const shift = drawPlayers(
    ctx,
    team,
    isHome,
    penColors,
    players,
    fontFamily,
    availableWidth,
  );
  const teamPadding = 30; //todo expose
  ctx.translate(0, shift + teamPadding);
}
