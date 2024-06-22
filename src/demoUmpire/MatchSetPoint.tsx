import { PointState } from "./MatchScore";

export function MatchSetPoint({
  point,
  pointState,
}: {
  point: number;
  pointState: PointState;
}) {
  return (
    <span
      style={{
        fontSize: 40,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        textDecoration:
          pointState === PointState.MatchPoint ? "underline" : undefined,
      }}
    >
      {point}
    </span>
  );
}
