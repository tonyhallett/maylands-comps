import { useState } from "react";
import { getDigitMetricsForContext } from "./getDigitMetrics";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import { CardContent, Typography } from "@mui/material";
import { DraggableCard } from "../demoHelpers/DraggableCard";
import { useFontCanvas } from "./useFontCanvas";

// not concerned with horizontal positioning
export default function DemoSetAndPointTopAlignment() {
  const [setScore, setSetScore] = useState(3);
  const [pointScore, setPointScore] = useState(1);
  const [pointFontSize, setPointFontSize] = useState("1500");
  const [setFontSize, setSetFontSize] = useState("750");
  const { fontSelectionHtml, canvas, getCanvasFont } = useFontCanvas(
    () => {
      const shouldNotRender =
        isNaN(parseInt(pointFontSize)) || isNaN(parseInt(setFontSize));
      return !shouldNotRender;
    },
    (canvas, context) => {
      const pointCanvasFont = getCanvasFont(`${pointFontSize}px`);
      const pointDigitMetrics = getDigitMetricsForContext(
        pointCanvasFont,
        context,
      );
      const pointMetrics = pointDigitMetrics[pointScore];
      context.fillText(
        pointScore.toString(),
        pointMetrics.actualBoundingBoxLeft,
        pointMetrics.actualBoundingBoxAscent,
      );

      const setCanvasFont = getCanvasFont(`${setFontSize}px`);
      const setDigitMetrics = getDigitMetricsForContext(setCanvasFont, context);
      const setMetrics = setDigitMetrics[setScore];

      let shift =
        pointMetrics.actualBoundingBoxLeft +
        pointMetrics.actualBoundingBoxRight +
        setMetrics.actualBoundingBoxLeft;

      context.fillText(
        setScore.toString(),
        shift,
        setMetrics.actualBoundingBoxAscent,
      );
      shift = shift +=
        setMetrics.actualBoundingBoxRight + setMetrics.actualBoundingBoxLeft;
      context.fillText(
        setScore.toString(),
        shift,
        setMetrics.actualBoundingBoxAscent,
      );

      shift += setMetrics.actualBoundingBoxRight;
      context.font = pointCanvasFont;
      context.fillText(
        pointScore.toString(),
        shift + pointMetrics.actualBoundingBoxLeft,
        pointMetrics.actualBoundingBoxAscent,
      );
    },
  );
  const handleSetChange = (event: Event, newValue: number | number[]) => {
    setSetScore(newValue as number);
  };
  const handlePointChange = (event: Event, newValue: number | number[]) => {
    setPointScore(newValue as number);
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
            max={3}
            value={setScore}
            onChange={handleSetChange}
            onMouseDown={(evt) => evt.stopPropagation()}
          />
          <Typography gutterBottom>Point digit</Typography>
          <Slider
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={9}
            value={pointScore}
            onChange={handlePointChange}
            onClick={(evt) => evt.stopPropagation()}
            onMouseDown={(evt) => evt.stopPropagation()}
          />
          <TextField
            value={pointFontSize}
            onChange={(evt) => setPointFontSize(evt.target.value)}
            label="Point font size"
            variant="outlined"
          />
          <TextField
            value={setFontSize}
            onChange={(evt) => setSetFontSize(evt.target.value)}
            label="Set font size"
            variant="outlined"
          />
        </CardContent>
      </DraggableCard>
      {canvas}
    </>
  );
}
