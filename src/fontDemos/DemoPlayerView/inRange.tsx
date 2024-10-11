import { Size } from "../../commonTypes";

export function inRange(size: Size, constriant: Size) {
  return size.width <= constriant.width && size.height <= constriant.height;
}
