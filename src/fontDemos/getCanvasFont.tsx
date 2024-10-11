import { getFontFamily } from "../helpers/getFontFamily";

export function getCanvasFont(
  fontWeight: number,
  italic: boolean,
  fontSize: string,
  family: string,
): string {
  return `${italic ? "italic " : ""}${fontWeight} ${fontSize} ${getFontFamily(family)}`;
}
