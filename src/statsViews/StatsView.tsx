import { mangoFusionPalette } from "@mui/x-charts/colorPalettes";
import { GameScoreLineChart } from "./GameScoreLineChart";
import { GameScore, PointHistory } from "../umpire";
import {
  isGameOrMatchWon,
  isGamePoint,
  isMatchPoint,
} from "../umpire/pointStateHelpers";
import { scoreTooltipRenderer } from "./GameScoreLineChart/ScoreTooltipRenderer/scoreTooltipRenderer";
import Box from "@mui/material/Box/Box";

export function StatsView({
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
  team1Label,
  team2Label,
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
  team1Label: string;
  team2Label: string;
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
      <div key={i}>
        <div>
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
            yAxisLabel="Team points"
            team1Label={team1Label}
            team2Label={team2Label}
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
            axisTooltipRenderer={scoreTooltipRenderer}
          />
        </Box>
      </div>
    );
  });
}
