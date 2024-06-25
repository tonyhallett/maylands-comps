import { useTheme } from "@mui/material";
import { PointState } from "./MatchScore";
import { getContrastingPaletteColor } from "./getContrastingPaletteColor";

export function MatchGamePoint({
  point,
  pointState,
  fontSize,
}: {
  point: number;
  pointState: PointState;
  fontSize: number;
}) {
  const theme = useTheme();
  const isGameOrMatchPoint =
    pointState === PointState.MatchPoint || pointState === PointState.GamePoint;

  const color = isGameOrMatchPoint
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
