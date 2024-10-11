import { measureForLine } from "./helpers/measureForLine";
import { PenColors, TitleEntryFontFormat } from "./generateScorecard";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";

export function drawResultWon(
  ctx: CanvasRenderingContext2D,
  result: string,
  won: string,
  penColors: PenColors,
  resultFormat: TitleEntryFontFormat,
  wonFormat: TitleEntryFontFormat,
  fontFamily: string,
  availableWidth: number,
) {
  // need some margin from the table
  ctx.translate(0, 20);
  ctx.save();
  const titlePadding = 5;

  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    { fontFormat: resultFormat.title, text: getSuffixedTitle("Result") },
    { fontFormat: resultFormat.entry, text: result },
    { fontFormat: wonFormat.title, text: getSuffixedTitle("Won") },
    { fontFormat: wonFormat.entry, text: won },
  );

  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[0].metrics.width,
      y: maxAscent,
      padding: titlePadding,
    },
    results[0],
    results[1],
  );

  ctx.translate(availableWidth / 2, 0);

  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[2].metrics.width,
      y: maxAscent,
      padding: titlePadding,
    },
    results[2],
    results[3],
  );
  ctx.restore();
  ctx.translate(0, maxAscent + maxDescent + 20);
}
