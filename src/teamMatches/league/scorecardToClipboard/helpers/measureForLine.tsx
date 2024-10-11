import { FontFormat } from "../generateScorecard";
import { measureText } from "./measureTexts";

export interface TextForMeasurement {
  fontFormat: FontFormat;
  text: string;
}

export function measureForLine(
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  ...textForMeasurements: TextForMeasurement[]
) {
  const results = textForMeasurements.map(({ fontFormat, text }) => {
    const { canvasFont, metrics } = measureText(
      ctx,
      fontFormat,
      fontFamily,
      text,
    );
    return {
      metrics,
      canvasFont,
      text,
    };
  });
  const maxAscent = Math.max(
    ...results.map(({ metrics }) => metrics.fontBoundingBoxAscent),
  );
  const maxDescent = Math.max(
    ...results.map(({ metrics }) => metrics.fontBoundingBoxDescent),
  );
  return {
    results,
    maxAscent,
    maxDescent,
  };
}
