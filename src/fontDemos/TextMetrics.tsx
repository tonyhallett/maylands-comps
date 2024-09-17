import { useWebSafeFontSelection } from "./useFontSelection";
import { DigitMetrics, getDigitMetrics } from "./getDigitMetrics";
import { useState } from "react";

export function TextMetrics() {
  const [html, selectedFont] = useWebSafeFontSelection();
  const [vw, setVW] = useState(1);
  const [onlyDescents, setOnlyDescents] = useState(false);
  let digitsMetrics: DigitMetrics[] = [];
  if (selectedFont !== undefined) {
    digitsMetrics = getDigitMetrics(`${vw}vw ${selectedFont}`);
  }

  return (
    <>
      {html}
      <label htmlFor="onlyDescents">Only Descents</label>
      <input
        type="checkbox"
        checked={onlyDescents}
        onChange={(e) => {
          setOnlyDescents(e.target.checked);
        }}
        id="onlyDescents"
      />
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
      {digitsMetrics.map((digitMetrics) => {
        const shouldRender = onlyDescents
          ? digitMetrics.actualBoundingBoxDescent > 0
          : true;
        return (
          shouldRender && (
            <div key={digitMetrics.digit}>
              <div>Digit: {digitMetrics.digit}</div>
              <div>
                Actual Bounding Box Ascent:{" "}
                {digitMetrics.actualBoundingBoxAscent}
              </div>
              <div>
                Actual Bounding Box Descent:{" "}
                {digitMetrics.actualBoundingBoxDescent}
              </div>
              <div>
                Actual Bounding Box Left: {digitMetrics.actualBoundingBoxLeft}
              </div>
              <div>
                Actual Bounding Box Right: {digitMetrics.actualBoundingBoxRight}
              </div>
              <div>Width: {digitMetrics.width}</div>
              <hr />
            </div>
          )
        );
      })}
    </>
  );
}
