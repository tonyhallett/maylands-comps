import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";
import { getDigitMetricsForContext } from "./getDigitMetrics";
import { FixedToBottomRight } from "./DemoTextPlacement";
import { getCanvasFont } from "./getCanvasFont";
import { useMonospaceFontSelection } from "./useMonospaceFontSelection";

export function DemoMonospaceFonts() {
  const [html, selectedFont] = useMonospaceFontSelection();
  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      if (selectedFont === undefined) {
        return;
      }
      context.reset();
      const canvasFont = getCanvasFont(
        selectedFont.weight,
        selectedFont.italic,
        "100px",
        selectedFont.family,
      );
      const digitMetrics = getDigitMetricsForContext(canvasFont, context);
      const maxAscender = digitMetrics.reduce(
        (max, metric) => Math.max(max, metric.actualBoundingBoxAscent),
        0,
      );
      digitMetrics.forEach((digitMetric, counter) => {
        context.fillText(
          digitMetric.digit.toString(),
          0,
          (counter + 1) * maxAscender,
        );
      });
    },
  );
  return (
    <>
      <FixedToBottomRight>{html}</FixedToBottomRight>
      {canvas}
    </>
  );
}
