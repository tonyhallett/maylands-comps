import { getFontFamily } from "../../fontDemos/getCanvasFont";
import { FontFormat } from "../generateScorecard";

export function getItalicOrBold(isItalic: boolean, present: boolean): string {
  const str = isItalic ? "italic " : "bold";
  const css = `${str} `;
  return `${present ? `${css}` : ""}`;
}

function getCanvasFont(
  italic: boolean,
  bold: boolean,
  fontSize: string,
  family: string,
): string {
  return `${getItalicOrBold(true, italic)}${getItalicOrBold(false, bold)} ${fontSize} ${getFontFamily(family)}`;
}

export function getScorecardCanvasFont(
  fontFormat: FontFormat,
  family: string,
): string {
  return getCanvasFont(
    false,
    fontFormat.isBold,
    `${fontFormat.size.toString()}px`,
    family,
  );
}
