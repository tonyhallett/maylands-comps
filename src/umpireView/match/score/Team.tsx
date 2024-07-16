import { TeamScore } from "../../../umpire";
import { Points } from "./Points";
import { Games } from "./Games";
import { PointState } from "./MatchScore";
import { Box } from "@mui/material";

export interface TeamFontSizes {
  gamePointFontSize: number;
  setPointFontSize: number;
}
export function Team({
  teamScore,
  pointState,
  isLeft,
  gamePointFontSize,
  setPointFontSize,
}: TeamFontSizes & {
  teamScore: TeamScore;
  pointState: PointState;
  isLeft: boolean;
}) {
  const points = (
    <Points
      isRight={!isLeft}
      fontSize={gamePointFontSize}
      points={teamScore.points}
      pointState={pointState}
    />
  );
  const games = (
    <Games
      fontSize={setPointFontSize}
      points={teamScore.games}
      pointState={pointState}
    />
  );

  return (
    <Box
      component="section"
      ml={isLeft ? 0 : 1}
      mr={isLeft ? 1 : 0}
      flex="1 1 0"
      fontFamily={[`"Chivo Mono"`]}
      fontWeight="900"
      textAlign={isLeft ? "right" : "left"}
      aria-label={isLeft ? "Left team" : "Right team"}
    >
      {isLeft ? points : games}
      <span style={{ margin: "0 0.1em" }}></span>
      {isLeft ? games : points}
    </Box>
  );
}
