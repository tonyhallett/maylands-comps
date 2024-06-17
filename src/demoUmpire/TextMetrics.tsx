import { useEffect, useRef, useState } from "react";

export interface DigitMetrics {
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  width: number;
  digit: number;
}

export function getMetrics(font: string): DigitMetrics[] {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `12px ${font}`;
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return digits.map((digit) => {
    const textMetrics = context.measureText(digit.toString());
    return {
      actualBoundingBoxAscent: textMetrics.actualBoundingBoxAscent,
      actualBoundingBoxDescent: textMetrics.actualBoundingBoxDescent,
      actualBoundingBoxLeft: textMetrics.actualBoundingBoxLeft,
      actualBoundingBoxRight: textMetrics.actualBoundingBoxRight,
      width: textMetrics.width,
      digit,
    };
  });
}
const webSafeFonts = [
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
];
export function useFontSelection(fonts: string[]) {
  const [selectedFont, setSelectedFont] = useState<string>(undefined);
  fonts = fonts.length === 0 ? webSafeFonts : fonts;
  const html = (
    <>
      <label>Select font</label>
      <select
        style={{ marginLeft: 5 }}
        value={selectedFont}
        onChange={(e) => {
          setSelectedFont(e.target.value);
        }}
      >
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </>
  );
  return [html, selectedFont] as const;
}

function fixCanvasHighRes(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  const dpr = window.devicePixelRatio;
  const rect = canvas.getBoundingClientRect();

  // Set the "actual" size of the canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr);

  // Set the "drawn" size of the canvas
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

export function DemoTextPlacement() {
  const fixedCanvasRef = useRef(false);
  const [word, setWord] = useState("1");
  const [html, selectedFont] = useFontSelection([]);
  const [vw, setVW] = useState(1);
  const canvas = useCanvas((c) => {
    const context = c.getContext("2d");
    if (!fixedCanvasRef.current) {
      fixCanvasHighRes(c, context);
      fixedCanvasRef.current = true;
    }
    c.style.border = "1px solid black";
    context.font = `bold ${vw}vw ${selectedFont}`;
    context.clearRect(0, 0, c.width, c.height);
    const measurement = context.measureText(word);
    const verticalShift = 5;
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
  });
  return (
    <>
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
      {canvas}
    </>
  );
}

export function useCanvas(canvasCallback: (canvas: HTMLCanvasElement) => void) {
  const inputRef = useRef(null);
  useEffect(() => {
    const canvas = inputRef.current;
    canvasCallback(canvas);
  }, [canvasCallback]);
  return <canvas style={{ width: 400, height: 400 }} ref={inputRef} />;
}

export function TextMetrics() {
  const [html, selectedFont] = useFontSelection([]);
  let digitsMetrics = [];
  if (selectedFont !== undefined) {
    digitsMetrics = getMetrics(selectedFont);
  }

  return (
    <>
      {html}
      {digitsMetrics.map((digitMetrics) => (
        <div key={digitMetrics.digit}>
          <div>Digit: {digitMetrics.digit}</div>
          <div>
            Actual Bounding Box Ascent: {digitMetrics.actualBoundingBoxAscent}
          </div>
          <div>
            Actual Bounding Box Descent: {digitMetrics.actualBoundingBoxDescent}
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
      ))}
    </>
  );
}
