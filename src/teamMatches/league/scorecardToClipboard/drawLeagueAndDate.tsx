import { PenColors, LeagueAndDate } from "./generateScorecard";
import { measureForLine } from "./helpers/measureForLine";
import { fillTextWithColor } from "./helpers/fillTextWithColor";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";

export function drawLeagueAndDate(
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  date: Date,
  leagueAndDate: LeagueAndDate,
  fontFamily: string,
) {
  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    {
      fontFormat: leagueAndDate.league,
      text: "Romford & District Table Tennis League",
    },
    {
      fontFormat: leagueAndDate.date.title,
      text: "Date: -",
    },
    {
      fontFormat: leagueAndDate.date.entry,
      text: date.toLocaleDateString(),
    },
  );

  fillTextWithColor(
    ctx,
    results[0].text,
    leagueAndDate.league.x,
    maxAscent,
    penColors.title,
    results[0].canvasFont,
  );

  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: leagueAndDate.date.x,
      titleWidth: results[1].metrics.width,
      y: maxAscent,
      titleMarginRight: leagueAndDate.date.titleMarginRight,
    },
    results[1],
    results[2],
  );

  return maxAscent + maxDescent;
}
