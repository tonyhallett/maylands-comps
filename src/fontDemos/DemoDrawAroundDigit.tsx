import { CardContent, Typography, Slider } from "@mui/material";
import { useState } from "react";
import { DraggableCard } from "../demoHelpers/DraggableCard";
import { getDigitMetricsForContext } from "./getDigitMetrics";
import { useFontCanvas } from "./useFontCanvas";

export default function DemoDrawAroundDigit() {
  const [digit, setDigit] = useState(0);
  const { fontSelectionHtml, canvas, getCanvasFont } = useFontCanvas(
    () => true,
    (canvas, context) => {
      const pointCanvasFont = getCanvasFont(500);
      // could store this as applies to all digits for the selected font
      const pointDigitMetrics = getDigitMetricsForContext(
        pointCanvasFont,
        context,
      );
      pointDigitMetrics.forEach((pointMetrics, digit) => {
        let details = `Digit: ${digit}`;
        details += ` Left: ${pointMetrics.actualBoundingBoxLeft}`;
        details += ` Right: ${pointMetrics.actualBoundingBoxRight}`;
        details += ` Width: ${pointMetrics.width}`;
        details += ` Ascent: ${pointMetrics.actualBoundingBoxAscent}`;
        details += ` Descent: ${pointMetrics.actualBoundingBoxDescent}`;
        console.log(details);
      });
      const yShift = 600;
      const xShift = 600;
      const pointMetrics = pointDigitMetrics[digit];
      context.fillText(digit.toString(), xShift, yShift);

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

      const left = xShift - pointMetrics.actualBoundingBoxLeft;
      const right = xShift + pointMetrics.actualBoundingBoxRight;
      const top = yShift - pointMetrics.actualBoundingBoxAscent;
      const bottom = yShift + pointMetrics.actualBoundingBoxDescent;
      const drawLeftSide = () => {
        drawLine(left, top, left, bottom);
      };
      const drawRightSide = () => {
        drawLine(right, top, right, bottom);
      };

      const drawTopSide = () => {
        drawLine(left, top, right, top);
      };
      const drawBottomSide = () => {
        drawLine(left, bottom, right, bottom);
      };
      context.strokeStyle = "red";
      drawLeftSide();
      drawRightSide();
      drawTopSide();
      drawBottomSide();
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
