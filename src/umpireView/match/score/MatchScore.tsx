import { Card } from "@mui/material";
import { TeamScore } from "../../../umpire";
import { TeamPoints, TeamPointsFontSizes } from "./TeamPoints";

export enum PointState {
  Normal,
  GamePoint,
  MatchPoint,
  Won,
}

export function MatchScore({
  leftScore,
  rightScore,
  leftPointState,
  rightPointState,
  gamePointFontSize,
  setPointFontSize,
}: TeamPointsFontSizes & {
  leftScore: TeamScore;
  rightScore: TeamScore;
  leftPointState: PointState;
  rightPointState: PointState;
}) {
  return (
    <Card variant="outlined">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TeamPoints
          teamScore={leftScore}
          pointState={leftPointState}
          isLeft={true}
          gamePointFontSize={gamePointFontSize}
          setPointFontSize={setPointFontSize}
        />
        <TeamPoints
          teamScore={rightScore}
          pointState={rightPointState}
          isLeft={false}
          gamePointFontSize={gamePointFontSize}
          setPointFontSize={setPointFontSize}
        />
      </div>
    </Card>
  );
}
