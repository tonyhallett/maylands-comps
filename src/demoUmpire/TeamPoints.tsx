import { TeamScore } from "../umpire";
import { MatchGamePoint } from "./MatchGamePoint";
import { MatchSetPoint } from "./MatchSetPoint";
import { PointState } from "./MatchScore";

export function TeamPoints({
  teamScore,
  pointState,
  isLeft,
}: {
  teamScore: TeamScore;
  pointState: PointState;
  isLeft: boolean;
}) {
  const gamePoint = (
    <MatchGamePoint point={teamScore.points} pointState={pointState} />
  );
  const setPoint = (
    <MatchSetPoint point={teamScore.games} pointState={pointState} />
  );
  return (
    <div style={{ flex: "1 1 0", textAlign: isLeft ? "right" : "left" }}>
      {isLeft ? gamePoint : setPoint}
      {isLeft ? setPoint : gamePoint}
    </div>
  );
}
