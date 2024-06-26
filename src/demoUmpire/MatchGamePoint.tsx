import { useTheme } from "@mui/material";
import { PointState } from "./MatchScore";
import { getContrastingPaletteColor } from "./getContrastingPaletteColor";

export function MatchGamePoint({
  point,
  pointState,
  fontSize,
  isRight,
}: {
  point: number;
  pointState: PointState;
  fontSize: number;
  isRight: boolean;
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
  let rightNegative = "";
  if (isRight && point < 0) {
    point = Math.abs(point);
    rightNegative = "-";
  }
  return (
    <span
      style={{
        fontSize,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        color,
      }}
    >
      {point}
      {rightNegative}
    </span>
  );
}
