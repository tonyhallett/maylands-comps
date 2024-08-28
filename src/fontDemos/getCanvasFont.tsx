export function getFontFamily(font: string): string {
  if (font.includes(" ")) {
    return `'${font}'`;
  }
  return font;
}

export function getCanvasFont(
  fontWeight: number,
  italic: boolean,
  fontSize: string,
  family: string,
): string {
  return `${italic ? "italic " : ""}${fontWeight} ${fontSize} ${getFontFamily(family)}`;
}
