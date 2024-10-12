import { PenColors, PlayerConfig, TeamConfig } from "./generateScorecard";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";
import { measureForLine } from "./helpers/measureForLine";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";
import { saveRestore } from "./helpers/saveRestore";
import { drawPlayers } from "./drawPlayers";

export type PlayerNameOrUndefineds = (string | undefined)[];
export interface Team {
  name: string;
  players: PlayerNameOrUndefineds;
}

export function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: Team,
  isHome: boolean,
  penColors: PenColors,
  teamConfig: TeamConfig,
  playerConfig: PlayerConfig,
  fontFamily: string,
  availableWidth: number,
) {
  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    {
      fontFormat: teamConfig.title,
      text: getSuffixedTitle(`${isHome ? "Home" : "Away"} Team`),
    },
    { fontFormat: teamConfig.entry, text: team.name },
  );
  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[0].metrics.width,
      y: maxAscent,
      titleMarginRight: teamConfig.titleMarginRight,
    },
    results[0],
    results[1],
  );

  ctx.translate(0, teamConfig.titleEntryMarginBottom + maxAscent + maxDescent);
  return saveRestore(ctx, () => {
    return drawPlayers(
      ctx,
      team,
      isHome,
      penColors,
      playerConfig,
      fontFamily,
      availableWidth,
    );
  });
}
