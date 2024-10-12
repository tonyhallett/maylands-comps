import { Signature } from "../generateScorecard";
import { RGB } from "./RGB";
import { getOnloadPromise } from "./getOnloadPromise";
import { cloneImageData } from "./cloneImageData";
import { replaceImageDataColor } from "./replaceImageDataColor";
import { imageFromCanvas } from "./imageFromCanvas";

export function changeSignatureColor(
  signature: HTMLImageElement,
  newRGB: RGB,
  replaceRGB?: RGB,
): HTMLImageElement {
  const createCanvasAndContext = () => {
    const canvas = document.createElement("canvas");
    canvas.width = signature.width;
    canvas.height = signature.height;
    const ctx = canvas.getContext("2d")!;
    return {
      canvas,
      ctx,
    };
  };

  const { canvas, ctx } = createCanvasAndContext();
  ctx.drawImage(signature, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const imageDataCopy = cloneImageData(imageData);

  const replaced = replaceImageDataColor(imageDataCopy, newRGB, replaceRGB);
  if (replaced) {
    const { canvas, ctx } = createCanvasAndContext();
    ctx.putImageData(imageDataCopy, 0, 0);
    return imageFromCanvas(canvas);
  }
  return signature;
}

export async function changeSignatureColors(
  home: Signature,
  away: Signature,
  newRGB: RGB,
  replaceRGB?: RGB,
) {
  if (home) {
    home = changeSignatureColor(home, newRGB, replaceRGB);
  }
  if (away) {
    away = changeSignatureColor(away, newRGB, replaceRGB);
  }
  const aSignatureOrUndefined =
    home !== undefined ? home : away !== undefined ? away : undefined;
  const promise = aSignatureOrUndefined
    ? getOnloadPromise(aSignatureOrUndefined)
    : Promise.resolve();
  await promise;
  return { homeSignature: home, awaySignature: away };
}
