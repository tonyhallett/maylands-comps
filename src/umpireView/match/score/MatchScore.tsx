import { Card } from "@mui/material";
import { TeamScore } from "../../../umpire";
import { Team, TeamFontSizes } from "./Team";

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
}: TeamFontSizes & {
  leftScore: TeamScore;
  rightScore: TeamScore;
  leftPointState: PointState;
  rightPointState: PointState;
}) {
  return (
    <Card variant="outlined">
      <section
        aria-label="Match score"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Team
          teamScore={leftScore}
          pointState={leftPointState}
          isLeft={true}
          gamePointFontSize={gamePointFontSize}
          setPointFontSize={setPointFontSize}
        />
        <Team
          teamScore={rightScore}
          pointState={rightPointState}
          isLeft={false}
          gamePointFontSize={gamePointFontSize}
          setPointFontSize={setPointFontSize}
        />
      </section>
    </Card>
  );
}
