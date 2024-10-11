export function getFontFamily(font: string): string {
  if (font.includes(" ")) {
    return `'${font}'`;
  }
  return font;
}
