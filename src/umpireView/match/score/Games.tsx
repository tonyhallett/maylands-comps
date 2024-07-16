import { useTheme } from "@mui/material";
import { PointState } from "./MatchScore";
import { getContrastingPaletteColor } from "../../../themeHelpers/getContrastingPaletteColor";

export function Games({
  points,
  pointState,
  fontSize,
}: {
  points: number;
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
      aria-label="Games"
      style={{
        fontSize,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        color,
      }}
    >
      {points}
    </span>
  );
}
