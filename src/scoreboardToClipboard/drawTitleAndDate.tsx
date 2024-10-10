import { PenColors, LeagueAndDate } from "./generateScorecard";
import { measureForLine } from "./helpers/measureForLine";
import { fillTextWithColor } from "./helpers/fillTextWithColor";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";

export function drawTitleAndDate(
  ctx: CanvasRenderingContext2D,
  penColors: PenColors,
  date: Date,
  leagueAndDate: LeagueAndDate,
  fontFamily: string,
) {
  ctx.translate(0, leagueAndDate.paddingTopBottom);

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
      padding: 5,
    },
    results[1],
    results[2],
  );

  ctx.translate(0, leagueAndDate.paddingTopBottom + maxAscent + maxDescent);
}
