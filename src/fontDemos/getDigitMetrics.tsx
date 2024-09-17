export interface DigitMetrics {
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  width: number;
  digit: number;
}

export function getDigitMetrics(font: string): DigitMetrics[] {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  return getDigitMetricsForContext(font, context);
}

export function getDigitMetricsForContext(
  font: string,
  context: CanvasRenderingContext2D,
): DigitMetrics[] {
  context.font = font;
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
