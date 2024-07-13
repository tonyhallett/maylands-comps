import { mangoFusionPalette } from "@mui/x-charts/colorPalettes";
import { GameScoreLineChart } from "../../charts/demo/GameScoreLineChart";
import { GameScore, PointHistory } from "../../umpire";
import {
  isGameOrMatchWon,
  isGamePoint,
  isMatchPoint,
} from "../../umpire/pointStateHelpers";
import { demoScoreTooltipRenderer } from "../../charts/demo/demoScoreTooltipRenderer";
import Box from "@mui/material/Box/Box";

export function HistoryView({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  team1StartScore,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  team2StartScore,
  gameScores,
  team1Left,
  matchWon,
  pointHistory,
  currentGameScore,
  gamePoint,
  upTo,
}: {
  matchWon: boolean;
  currentGameScore: GameScore;
  team1Left: boolean;
  gameScores: ReadonlyArray<GameScore>;
  pointHistory: ReadonlyArray<ReadonlyArray<PointHistory>>;
  team1StartScore: number;
  team2StartScore: number;
  gamePoint: number;
  upTo: number;
}) {
  gameScores = [...gameScores].reverse();
  if (!matchWon) {
    gameScores = [currentGameScore, ...gameScores];
  }
  const minX = upTo - Math.min(team1StartScore, team2StartScore);
  const numGameScores = gameScores.length;
  return gameScores.map((gameScore, i) => {
    const pointHistoryForGame = pointHistory[numGameScores - i - 1];
    return (
      <>
        <div key={i}>
          {`${team1Left ? gameScore.team1Points : gameScore.team2Points} - ${!team1Left ? gameScore.team1Points : gameScore.team2Points}`}
        </div>
        <Box sx={{ width: "100%", height: 400 }}>
          <GameScoreLineChart
            colors={mangoFusionPalette}
            minX={minX}
            minY={upTo}
            gamePoint={gamePoint}
            reversed={false}
            xAxisLabel="Points scored"
            yAxisLabel="Game points"
            team1Label="Team 1" //todo
            team2Label="Team 2" //todo
            startScore={{
              team1Points: team1StartScore,
              team2Points: team2StartScore,
            }}
            mark={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              getColor(team1, score, isStartScore) {
                if (isGamePoint(score.pointState)) {
                  return "orange";
                } else if (isMatchPoint(score.pointState)) {
                  return "red";
                }
              },
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              getShape(team1, score, isStartScore) {
                if (isGameOrMatchWon(score.pointState)) {
                  return "wye";
                }
              },
              showMark(team1, score, isStartScore) {
                if (isStartScore) {
                  return false;
                }
                return score.team1WonPoint === team1;
              },
            }}
            scores={[...pointHistoryForGame]}
            axisTooltipRenderer={demoScoreTooltipRenderer}
          />
        </Box>
      </>
    );
  });
}
