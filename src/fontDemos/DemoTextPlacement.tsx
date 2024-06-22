import { PropsWithChildren, useCallback, useState } from "react";
import { useWebSafeFontSelection } from "./useFontSelection";
import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";
import { getDigitMetricsForContext } from "./getDigitMetrics";

export function DemoCenterText() {
  const [html, selectedFont] = useWebSafeFontSelection();
  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      context.clearRect(0, 0, c.width, c.height);
      const digitMetrics = getDigitMetricsForContext(
        `100px ${selectedFont}`,
        context,
      );
      const newDigitMetrics = digitMetrics.map((digitMetric) => {
        const width =
          digitMetric.actualBoundingBoxRight +
          digitMetric.actualBoundingBoxLeft;
        return {
          ...digitMetric,
          width,
        };
      });
      const maxAscender = newDigitMetrics.reduce(
        (max, metric) => Math.max(max, metric.actualBoundingBoxAscent),
        0,
      );
      const maxWidth = newDigitMetrics.reduce(
        (max, metric) => Math.max(max, metric.width),
        0,
      );
      newDigitMetrics.forEach((digitMetric, counter) => {
        context.fillText(
          digitMetric.digit.toString(),
          digitMetric.actualBoundingBoxLeft +
            (maxWidth - digitMetric.width) / 2,
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

export function FixedToBottomRight({ children }: PropsWithChildren) {
  return (
    <div style={{ position: "fixed", bottom: 0, right: 0 }}>{children}</div>
  );
}

export function DemoTextPlacement() {
  const [word, setWord] = useState("1");
  const [html, selectedFont] = useWebSafeFontSelection();
  const [vw, setVW] = useState(1);
  const draw = useCallback(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      context.font = `${vw}vw ${selectedFont}`;
      context.clearRect(0, 0, c.width, c.height);
      const measurement = context.measureText(word);
      const verticalShift = 0;
      const drawText = (shiftBoundingBox: boolean) => {
        context.fillText(
          word,
          shiftBoundingBox ? measurement.actualBoundingBoxLeft : 0,
          (shiftBoundingBox ? 1 : 2) * measurement.actualBoundingBoxAscent +
            verticalShift,
        );
      };

      drawText(true);
      drawText(false); // the bottom one
    },
    [vw, selectedFont, word],
  );
  const canvas = useFullscreen2dCanvas(draw);
  return (
    <>
      <div style={{ position: "fixed", bottom: 0 }}>
        {html}
        <label htmlFor="vm">VM</label>
        <input
          type="range"
          value={vw}
          onChange={(e) => {
            setVW(e.target.valueAsNumber);
          }}
          id="vm"
          min="1"
          max="100"
        />
        <input
          style={{ display: "block", marginBottom: 10 }}
          type="text"
          value={word}
          onChange={(e) => {
            setWord(e.target.value);
          }}
        />
      </div>
      {canvas}
    </>
  );
}
