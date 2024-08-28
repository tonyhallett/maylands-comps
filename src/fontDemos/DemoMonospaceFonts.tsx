import { getDigitMetricsForContext } from "./getDigitMetrics";
import { FixedToBottomRight } from "./DemoTextPlacement";
import { useFontCanvas } from "./useFontCanvas";

export function DemoMonospaceFonts() {
  const { fontSelectionHtml, canvas, getCanvasFont } = useFontCanvas(
    () => true,
    (canvas, context) => {
      const canvasFont = getCanvasFont(100);
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
      <FixedToBottomRight>{fontSelectionHtml}</FixedToBottomRight>
      {canvas}
    </>
  );
}
