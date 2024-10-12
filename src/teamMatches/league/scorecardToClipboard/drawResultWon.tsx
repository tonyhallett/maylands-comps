import { measureForLine } from "./helpers/measureForLine";
import { PenColors, ResultWonConfig } from "./generateScorecard";
import { drawTitleAndEntry } from "./helpers/drawTitleAndEntry";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";

export function drawResultWon(
  ctx: CanvasRenderingContext2D,
  result: string,
  won: string,
  penColors: PenColors,
  resultWon: ResultWonConfig,
  fontFamily: string,
  availableWidth: number,
) {
  const { results, maxAscent, maxDescent } = measureForLine(
    ctx,
    fontFamily,
    { fontFormat: resultWon.result.title, text: getSuffixedTitle("Result") },
    { fontFormat: resultWon.result.entry, text: result },
    { fontFormat: resultWon.won.title, text: getSuffixedTitle("Won") },
    { fontFormat: resultWon.won.entry, text: won },
  );

  const resultEntryMaxWidth =
    availableWidth / 2 -
    resultWon.result.titleMarginRight -
    resultWon.result.entryMarginRight;
  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[0].metrics.width,
      y: maxAscent,
      titleMarginRight: resultWon.result.titleMarginRight,
    },
    results[0],
    { ...results[1], maxWidth: resultEntryMaxWidth },
  );

  ctx.translate(availableWidth / 2, 0);

  drawTitleAndEntry(
    ctx,
    penColors,
    {
      titleX: 0,
      titleWidth: results[2].metrics.width,
      y: maxAscent,
      titleMarginRight: resultWon.won.titleMarginRight,
    },
    results[2],
    results[3],
  );
  return maxAscent + maxDescent + resultWon.marginBottom;
}
