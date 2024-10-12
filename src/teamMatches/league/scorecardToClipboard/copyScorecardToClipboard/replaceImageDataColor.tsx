import { RGB } from "./RGB";

export function replaceImageDataColor(
  imageDataCopy: ImageData,
  newRGB: RGB,
  replaceRGB?: RGB,
) {
  let replaced = false;
  for (let i = 0; i < imageDataCopy.data.length; i += 4) {
    const r = imageDataCopy.data[i + 0];
    const g = imageDataCopy.data[i + 1];
    const b = imageDataCopy.data[i + 2];
    const a = imageDataCopy.data[i + 3];
    if (replaceRGB === undefined) {
      if (a !== 0) {
        imageDataCopy.data[i + 0] = newRGB.r;
        imageDataCopy.data[i + 1] = newRGB.g;
        imageDataCopy.data[i + 2] = newRGB.b;
        replaced = true;
      }
    } else {
      if (r === replaceRGB.r && g === replaceRGB.g && b === replaceRGB.b) {
        imageDataCopy.data[i + 0] = newRGB.r;
        imageDataCopy.data[i + 1] = newRGB.g;
        imageDataCopy.data[i + 2] = newRGB.b;
        replaced = true;
      }
    }
  }
  return replaced;
}
