import { useTheme } from "@mui/material";
import { PointState } from "./MatchScore";
import { getContrastingPaletteColor } from "../../../themeHelpers/getContrastingPaletteColor";

export function Points({
  points,
  pointState,
  fontSize,
  isRight,
}: {
  points: number;
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
  if (isRight && points < 0) {
    points = Math.abs(points);
    rightNegative = "-";
  }
  return (
    <span
      aria-label="Points"
      style={{
        fontSize,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        color,
      }}
    >
      {points}
      {rightNegative}
    </span>
  );
}
