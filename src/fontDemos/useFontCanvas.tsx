import { useState, useRef, useEffect } from "react";
import {
  CanvasCallback,
  useFullscreen2dCanvas,
} from "../canvasHelpers/useFullscreen2dCanvas";
import { fontFaces } from "./fontInfo";
import { useSelect } from "./useFontSelection";
import { getFontFamily } from "./getCanvasFont";

type FontInfo = (typeof fontFaces)[0];
export interface NameWeightFontInfo {
  name: string;
  fontInfo: FontInfo;
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

export const nameWeightFontInfos: NameWeightFontInfo[] = [];
fontFaces.forEach((fontFace) => {
  const fontWeight = fontFace["font-weight"];
  const weightsRange = fontWeight.split(" ");
  const weights =
    weightsRange.length === 1
      ? [fontWeight]
      : getWeights(weightsRange[0], weightsRange[1]);
  weights.forEach((weight) => {
    const name = `${fontFace["font-family"]} ${weight} ${fontFace["font-style"]}`;
    nameWeightFontInfos.push({ name, fontInfo: fontFace, weight });
  });
});

export const getCanvasFontString = (
  fontFace: FontInfo,
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
    nameWeightFontInfos,
  );
  const [loadedFont, setLoadedFont] = useState<NameWeightFontInfo | undefined>(
    undefined,
  );
  const isLoadingRef = useRef(true);
  useEffect(() => {
    if (selectedFont === undefined) return;
    if (loadedFont === selectedFont) return;
    const fontInfo = selectedFont.fontInfo;
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
  const getCanvasFont = (fontSize: string) => {
    if (loadedFont === undefined) return "";
    return getCanvasFontString(
      loadedFont.fontInfo,
      fontSize,
      loadedFont.weight,
    );
  };
  return { fontSelectionHtml, canvas, getCanvasFont };
}
