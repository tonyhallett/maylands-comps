import { PaletteColor } from "@mui/material";

export function getContrastingPaletteColor(
  paletteColor: PaletteColor,
  isDark: boolean,
) {
  return isDark ? paletteColor.light : paletteColor.dark;
}
