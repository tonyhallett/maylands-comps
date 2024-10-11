import { useRef, useState, useEffect } from "react";
import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";
import { binarySearch } from "./binarySearch";
import {
  getCanvasFontString,
  WeightFontInfo,
} from "../fontDemos/useFontCanvas";
import { Size } from "../commonTypes";

export type GetCanvasFontString = (fontSize: number) => string;
export interface CanvasFontMaxImpl<TInstructions> {
  measurer: (
    fontSize: number,
    canvasSize: Size,
    context: CanvasRenderingContext2D,
    getCanvasFontString: GetCanvasFontString,
  ) => boolean;
  getInstructions: () => TInstructions;
  draw: (
    instructions: TInstructions,
    canvasRenderingContext2D: CanvasRenderingContext2D,
    getCanvasFontString: (fontSize: number) => string,
  ) => void;
}

export interface CanvasFontMaxStore<TInstructions> {
  get(fontKey: string): TInstructions;
  set(fontKey: string, instructions: TInstructions): void;
}

export interface CanvasFontMaxProps<TInstructions> {
  fontInfo: WeightFontInfo;
  impl: CanvasFontMaxImpl<TInstructions>;
  store?: CanvasFontMaxStore<TInstructions>;
}

interface MeasureInfo<TInstructions> {
  fontKey: string;
  instructions: TInstructions;
}

function getFontKey(fontInfo: WeightFontInfo) {
  return `${fontInfo.fontInfo["font-family"]} ${fontInfo.weight} ${fontInfo.fontInfo["font-style"]}`;
}

function newFontFace(fontInfo: WeightFontInfo) {
  return new FontFace(
    fontInfo.fontInfo["font-family"],
    `url(${fontInfo.fontInfo.filePath})`,
    {
      weight: fontInfo.weight,
      style: fontInfo.fontInfo["font-style"],
      //stretch todo
    },
  );
}

export function CanvasFontMax<TInstructions>({
  fontInfo,
  impl,
  store,
}: CanvasFontMaxProps<TInstructions>) {
  const measureInfoRef = useRef<MeasureInfo<TInstructions> | undefined>(
    undefined,
  );
  const getCanvasFontStringForFont = (fontSize: number) => {
    return getCanvasFontString(fontInfo, fontSize);
  };
  const getInstructions = (
    c: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ) => {
    const fontKey = getFontKey(fontInfo);
    let instructions: TInstructions | undefined;
    if (
      measureInfoRef.current !== undefined &&
      measureInfoRef.current.fontKey === fontKey
    ) {
      instructions = measureInfoRef.current.instructions;
    }

    if (instructions === undefined) {
      const fontKey = getFontKey(fontInfo);
      if (store !== undefined) {
        instructions = store.get(fontKey);
      }

      if (instructions === undefined) {
        binarySearch(
          (fontSize) => {
            return impl.measurer(
              fontSize,
              { width: c.width, height: c.height },
              context,
              getCanvasFontStringForFont,
            );
          },
          1,
          c.height,
        );
        instructions = impl.getInstructions();
        if (store !== undefined) {
          store.set(fontKey, instructions);
        }
      }
      measureInfoRef.current = { fontKey, instructions };
    }
    return instructions;
  };

  const canvas = useFullscreen2dCanvas(
    (c: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      if (loadedFont === undefined || loadedFont !== fontInfo) return;
      context.reset();
      const instructions = getInstructions(c, context);
      impl.draw(instructions, context, getCanvasFontStringForFont);
    },
  );
  const [loadedFont, setLoadedFont] = useState<WeightFontInfo | undefined>(
    undefined,
  );
  useEffect(() => {
    const fontFace = newFontFace(fontInfo);

    fontFace
      .load()
      .then(() => {
        document.fonts.add(fontFace);
        setLoadedFont(fontInfo);
      })
      .catch((e) => {
        alert(e.message);
      });
  }, [fontInfo]);

  return canvas;
}
