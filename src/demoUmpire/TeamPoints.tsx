import { TeamScore } from "../umpire";
import { MatchGamePoint } from "./MatchGamePoint";
import { MatchSetPoint } from "./MatchSetPoint";
import { PointState } from "./MatchScore";
import { Box } from "@mui/material";

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
    <Box
      ml={isLeft ? 0 : 1}
      mr={isLeft ? 1 : 0}
      flex="1 1 0"
      textAlign={isLeft ? "right" : "left"}
    >
      {isLeft ? gamePoint : setPoint}
      {isLeft ? setPoint : gamePoint}
    </Box>
  );
}
