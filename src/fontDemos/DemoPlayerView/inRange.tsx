import { WidthHeight } from "./CanvasFontMax";

export function inRange(widthHeight: WidthHeight, constriant: WidthHeight) {
  return (
    widthHeight.width <= constriant.width &&
    widthHeight.height <= constriant.height
  );
}
