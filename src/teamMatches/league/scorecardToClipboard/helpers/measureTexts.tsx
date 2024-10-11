import { FontFormat } from "../generateScorecard";
import { getScorecardCanvasFont } from "./getCanvasFont";

export function measureText(
  ctx: CanvasRenderingContext2D,
  fontFormat: FontFormat,
  fontFamily: string,
  text: string,
) {
  const { canvasFont, metrics, texts } = measureTexts(
    ctx,
    fontFormat,
    fontFamily,
    text,
  );
  return {
    metrics: metrics[0],
    canvasFont,
    text: texts[0],
  };
}
export function measureTexts(
  ctx: CanvasRenderingContext2D,
  fontFormat: FontFormat,
  fontFamily: string,
  ...texts: string[]
) {
  const canvasFont = getScorecardCanvasFont(fontFormat, fontFamily);
  ctx.font = canvasFont;
  return {
    metrics: texts.map((text) => ctx.measureText(text)),
    canvasFont,
    texts,
  };
}
