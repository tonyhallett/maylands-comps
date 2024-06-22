import { PointState } from "./MatchScore";

export function MatchGamePoint({
  point,
  pointState,
}: {
  point: number;
  pointState: PointState;
}) {
  return (
    <span
      style={{
        fontSize: 80,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        textDecoration:
          pointState === PointState.MatchPoint ||
          pointState === PointState.GamePoint
            ? "underline"
            : undefined,
      }}
    >
      {point}
    </span>
  );
}
