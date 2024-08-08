import { useEffect, useRef, useState } from "react";
import {
  CanvasCallback,
  useFullscreen2dCanvas,
} from "../canvasHelpers/useFullscreen2dCanvas";
import { getFontFamily } from "./getCanvasFont";
import { getDigitMetricsForContext } from "./getDigitMetrics";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import { CardContent, Typography } from "@mui/material";
import { DraggableCard } from "../demoHelpers/DraggableCard";
import { fontFaces } from "./fontInfo";
import { useSelect } from "./useFontSelection";

type MyFontFace = (typeof fontFaces)[0];
interface NameFontFace {
  name: string;
  fontFace: MyFontFace;
  weight: string;
}

function getWeights(startWeight: string, endWeight: string): string[] {
  const start = parseInt(startWeight);
  const end = parseInt(endWeight);
  const weights = [];
  for (let i = start; i <= end; i += 100) {
    weights.push(i.toString());
  }
  return weights;
}

const nameFontFaces: NameFontFace[] = [];
fontFaces.forEach((fontFace) => {
  const fontWeight = fontFace["font-weight"];
  const weightsRange = fontWeight.split(" ");
  const weights =
    weightsRange.length === 1
      ? [fontWeight]
      : getWeights(weightsRange[0], weightsRange[1]);
  weights.forEach((weight) => {
    const name = `${fontFace["font-family"]} ${weight} ${fontFace["font-style"]}`;
    nameFontFaces.push({ name, fontFace, weight });
  });
});
const getCanvasFontString = (
  fontFace: MyFontFace,
  fontSize: string,
  fontWeight: string,
) => {
  const fontStyle = fontFace["font-style"];
  const fontStylePart = fontStyle === "italic" ? "italic " : "";
  return `${fontStylePart}${fontWeight} ${fontSize} ${getFontFamily(fontFace["font-family"])}`;
};

export function useFontCanvas(
  shouldRender: () => boolean,
  render: CanvasCallback,
) {
  const [fontSelectionHtml, selectedFont] = useSelect(
    "Select font",
    nameFontFaces,
  );
  const [loadedFont, setLoadedFont] = useState<NameFontFace | undefined>(
    undefined,
  );
  const isLoadingRef = useRef(true);
  useEffect(() => {
    if (selectedFont === undefined) return;
    if (loadedFont === selectedFont) return;
    const fontInfo = selectedFont.fontFace;
    const fontFace = new FontFace(
      fontInfo["font-family"],
      `url(${fontInfo.filePath})`,
      {
        weight: fontInfo["font-weight"],
        style: fontInfo["font-style"],
        //stretch todo
      },
    );
    if (fontFace.status === "loaded") return;
    document.fonts.add(fontFace);
    isLoadingRef.current = true;
    fontFace
      .load()
      .then(() => {
        isLoadingRef.current = false;
        setLoadedFont(selectedFont);
      })
      .catch((e) => {
        alert(e.message);
      });
  }, [selectedFont, loadedFont]);
  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      if (loadedFont === undefined || isLoadingRef.current || !shouldRender()) {
        return;
      }
      context.reset();
      context.fillStyle = "yellow";
      context.fillRect(0, 0, c.width, c.height);
      context.fillStyle = "black";
      render(c, context);
    },
  );
  return { fontSelectionHtml, canvas };
}

// not concerned with horizontal positioning
export default function DemoSetAndPointTopAlignment() {
  const [fontSelectionHtml, selectedFont] = useSelect(
    "Select font",
    nameFontFaces,
  );
  const [loadedFont, setLoadedFont] = useState<NameFontFace | undefined>(
    undefined,
  );
  const isLoadingRef = useRef(true);
  const [setScore, setSetScore] = useState(3);
  const [pointScore, setPointScore] = useState(1);
  const [pointFontSize, setPointFontSize] = useState("1500");
  const [setFontSize, setSetFontSize] = useState("750");
  useEffect(() => {
    if (selectedFont === undefined) return;
    if (loadedFont === selectedFont) return;
    const fontInfo = selectedFont.fontFace;
    const fontFace = new FontFace(
      fontInfo["font-family"],
      `url(${fontInfo.filePath})`,
      {
        weight: fontInfo["font-weight"],
        style: fontInfo["font-style"],
        //stretch todo
      },
    );
    if (fontFace.status === "loaded") return;
    document.fonts.add(fontFace);
    isLoadingRef.current = true;
    fontFace
      .load()
      .then(() => {
        isLoadingRef.current = false;
        setLoadedFont(selectedFont);
      })
      .catch((e) => {
        alert(e.message);
      });
  }, [selectedFont, loadedFont]);

  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      if (
        loadedFont === undefined ||
        isLoadingRef.current ||
        isNaN(parseInt(pointFontSize)) ||
        isNaN(parseInt(setFontSize))
      ) {
        return;
      }
      context.reset();
      context.fillStyle = "yellow";
      context.fillRect(0, 0, c.width, c.height);
      context.fillStyle = "black";

      const pointCanvasFont = getCanvasFontString(
        loadedFont.fontFace,
        `${pointFontSize}px`,
        loadedFont.weight,
      );
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

      const setCanvasFont = getCanvasFontString(
        loadedFont.fontFace,
        `${setFontSize}px`,
        loadedFont.weight,
      );
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
