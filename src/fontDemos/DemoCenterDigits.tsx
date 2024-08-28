import { CardContent, Typography, Slider } from "@mui/material";
import { useState } from "react";
import { DraggableCard } from "../demoHelpers/DraggableCard";
import { DigitMetrics, getDigitMetricsForContext } from "./getDigitMetrics";
import { useFontCanvas } from "./useFontCanvas";

interface MaxDigitSize {
  width: number;
  height: number;
}

export function getMax(pointDigitMetrics: DigitMetrics[]) {
  const maxDigitSize: MaxDigitSize = {
    width: 0,
    height: 0,
  };
  pointDigitMetrics.reduce((maxDigitSize, pointMetric) => {
    const boundingWidth =
      pointMetric.actualBoundingBoxLeft + pointMetric.actualBoundingBoxRight;
    if (boundingWidth > maxDigitSize.width) {
      maxDigitSize.width = boundingWidth;
    }
    return maxDigitSize;
  }, maxDigitSize);
  return maxDigitSize;
}

export default function DemoCentreDigit() {
  const [digit, setDigit] = useState(0);
  const { fontSelectionHtml, canvas, getCanvasFont } = useFontCanvas(
    () => true,
    (canvas, context) => {
      context.textAlign = "left";
      const pointCanvasFont = getCanvasFont(500);
      // could store this as applies to all digits for the selected font
      const pointDigitMetrics = getDigitMetricsForContext(
        pointCanvasFont,
        context,
      );

      const yShift = 600;
      const xShift = 600;
      const pointMetrics = pointDigitMetrics[digit];
      const boundingWidth =
        pointMetrics.actualBoundingBoxLeft +
        pointMetrics.actualBoundingBoxRight;
      const digitShift = pointMetrics.actualBoundingBoxLeft - boundingWidth / 2;
      context.fillText(
        digit.toString(),
        xShift + digitShift,
        yShift - pointMetrics.actualBoundingBoxDescent,
      );

      const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      };

      const drawStartIndicator = () => {
        context.strokeStyle = "blue";
        drawLine(xShift, yShift, xShift + 300, yShift);
        drawLine(xShift, yShift, xShift, yShift - 400);
      };

      drawStartIndicator();
    },
  );
  const handleDigitChange = (event: Event, newValue: number | number[]) => {
    setDigit(newValue as number);
  };

  return (
    <>
      <DraggableCard cardStyle={{ position: "fixed", bottom: 10, right: 10 }}>
        <CardContent>
          {fontSelectionHtml}
          <Typography gutterBottom>Set digit</Typography>
          <Slider
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={9}
            value={digit}
            onChange={handleDigitChange}
            onMouseDown={(evt) => evt.stopPropagation()}
          />
        </CardContent>
      </DraggableCard>
      {canvas}
    </>
  );
}
