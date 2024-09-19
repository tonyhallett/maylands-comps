import { GetCanvasFontString } from "../../scoreboard/CanvasFontMax";
import { DigitMetrics, getDigitMetricsForContext } from "../getDigitMetrics";

export interface MaxMetrics {
  width: number;
  ascent: number;
  descent: number;
  height: number;
}
export interface DigitsMaxMetrics {
  max: MaxMetrics;
  metrics: DigitMetrics[];
}

export function getDigitsMax(
  fontSize: number,
  context: CanvasRenderingContext2D,
  getCanvasFontString: GetCanvasFontString,
): DigitsMaxMetrics {
  const contextFont = getCanvasFontString(fontSize);
  context.font = contextFont;
  const metrics = getDigitMetricsForContext(contextFont, context);
  const max: MaxMetrics = {
    width: 0,
    ascent: 0,
    descent: 0,
    height: 0,
  };
  metrics.reduce((maxWH, metric) => {
    // was this counter intuitive ?
    const width = metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight;
    maxWH.ascent = Math.max(maxWH.ascent, metric.actualBoundingBoxAscent);
    maxWH.descent = Math.max(maxWH.descent, metric.actualBoundingBoxDescent);
    maxWH.width = Math.max(maxWH.width, width);
    return maxWH;
  }, max);
  max.height = max.ascent + max.descent;
  return {
    max,
    metrics,
  };
}
