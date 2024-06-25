import { TeamScore } from "../umpire";
import { MatchGamePoint } from "./MatchGamePoint";
import { MatchSetPoint } from "./MatchSetPoint";
import { PointState } from "./MatchScore";
import { Box } from "@mui/material";

export interface TeamPointsFontSizes {
  gamePointFontSize: number;
  setPointFontSize: number;
}
export function TeamPoints({
  teamScore,
  pointState,
  isLeft,
  gamePointFontSize,
  setPointFontSize,
}: TeamPointsFontSizes & {
  teamScore: TeamScore;
  pointState: PointState;
  isLeft: boolean;
}) {
  const gamePoint = (
    <MatchGamePoint
      fontSize={gamePointFontSize}
      point={teamScore.points}
      pointState={pointState}
    />
  );
  const setPoint = (
    <MatchSetPoint
      fontSize={setPointFontSize}
      point={teamScore.games}
      pointState={pointState}
    />
  );

  return (
    <Box
      ml={isLeft ? 0 : 1}
      mr={isLeft ? 1 : 0}
      flex="1 1 0"
      fontFamily={[`"Chivo Mono"`]}
      fontWeight="900"
      textAlign={isLeft ? "right" : "left"}
    >
      {isLeft ? gamePoint : setPoint}
      <span style={{ margin: "0 0.1em" }}></span>
      {isLeft ? setPoint : gamePoint}
    </Box>
  );
}
