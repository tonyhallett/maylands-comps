import { useTheme } from "@mui/material";
import { PointState } from "./MatchScore";
import { getContrastingPaletteColor } from "../../../themeHelpers/getContrastingPaletteColor";

export function MatchSetPoint({
  point,
  pointState,
  fontSize,
}: {
  point: number;
  pointState: PointState;
  fontSize: number;
}) {
  const theme = useTheme();
  const color =
    pointState === PointState.MatchPoint
      ? getContrastingPaletteColor(
          theme.palette.success,
          theme.palette.mode === "dark",
        )
      : undefined;
  return (
    <span
      style={{
        fontSize,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        color,
      }}
    >
      {point}
    </span>
  );
}
