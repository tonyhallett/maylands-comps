import { PenColors, PlayerConfig } from "./generateScorecard";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";
import { measureForLine } from "./helpers/measureForLine";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";
import { Team } from "./drawTeam";

export const homeIdentifers = ["A", "B", "C"];
export const awayIdentifers = ["X", "Y", "Z"];

export const getPlayer = (player: string | undefined) =>
  player === undefined ? "-----" : player;

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  team: Team,
  isHome: boolean,
  penColors: PenColors,
  playerConfig: PlayerConfig,
  fontFamily: string,
  availableWidth: number,
) {
  const playerShare = availableWidth / 3;
  const playersIdentifers = isHome ? homeIdentifers : awayIdentifers;

  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    ...[0, 1, 2].flatMap((i) => {
      return [
        {
          fontFormat: playerConfig.title,
          text: getSuffixedTitle(playersIdentifers[i]),
        },
        {
          fontFormat: playerConfig.entry,
          text: getPlayer(team.players[i]),
        },
      ];
    }),
  );

  for (let i = 0; i < 3; i++) {
    if (i !== 0) {
      ctx.translate(playerShare, 0);
    }
    const titleWidth = results[i * 2].metrics.width;
    const maxWidth =
      playerShare -
      titleWidth -
      playerConfig.titleMarginRight -
      playerConfig.entryMarginRight;
    drawTitleAndEntry(
      ctx,
      penColors,
      {
        titleX: 0,
        titleWidth,
        y: maxAscent,
        titleMarginRight: playerConfig.titleMarginRight,
      },
      results[i * 2],
      { ...results[i * 2 + 1], maxWidth },
    );
  }

  return maxAscent + maxDescent;
}
