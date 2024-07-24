import { mangoFusionPalette } from "@mui/x-charts/colorPalettes";
import { GameScoreLineChart } from "./GameScoreLineChart";
import { GameScore, PointHistory } from "../umpire";
import {
  isGameOrMatchWon,
  isGamePoint,
  isGameWon,
  isMatchPoint,
  isMatchWon,
} from "../umpire/pointStateHelpers";
import { scoreTooltipRenderer } from "./GameScoreLineChart/ScoreTooltipRenderer/scoreTooltipRenderer";
import Box from "@mui/material/Box/Box";
import { GameStats, getGameStats } from "../matchstats";
import { LeadsStats } from "../matchstats/LeadStatistician";
import { StreaksStats } from "../matchstats/StreakStatistician";
import {
  PointsBreakdownStats,
  ServeReceiveRecord,
} from "../matchstats/PointsBreakdownStatistician";

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
    const gameStats = getGameStats([...pointHistoryForGame]);
    return (
      <div key={i}>
        <div>
          {`${team1Left ? gameScore.team1Points : gameScore.team2Points} - ${!team1Left ? gameScore.team1Points : gameScore.team2Points}`}
        </div>
        <GameStatsTable stats={gameStats} />
        <Box
          data-id={`game-${i}-score-line-chart-container`}
          sx={{ width: "100%", height: 400 }}
        >
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
              getColor(_, score, pointNumber) {
                if (isGameOrMatchWon(score.pointState)) {
                  return "white";
                }
                const gameMatchPointsForPointNumber = getGameStats(
                  pointHistoryForGame.slice(0, pointNumber),
                ).gameMatchPoints;
                if (gameMatchPointsForPointNumber !== undefined) {
                  const savedPointAt =
                    gameMatchPointsForPointNumber.savedPointsAt.find(
                      (savedPointAt) => savedPointAt.at === pointNumber,
                    );
                  if (savedPointAt !== undefined) {
                    return savedPointAt.isGamePoint ? "green" : "yellow";
                  }
                  if (isGamePoint(score.pointState)) {
                    return "orange";
                  }
                  if (isMatchPoint(score.pointState)) {
                    return "red";
                  }
                }
              },
              getShape(team1, score) {
                if (isMatchWon(score.pointState)) {
                  return "star";
                }
                if (isGameWon(score.pointState)) {
                  return "diamond";
                }
                return team1 ? "circle" : "square";
              },
              showMark(team1, score, index) {
                if (index === 0) {
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

function GameStatsTable({ stats }: { stats: GameStats }) {
  return (
    <table>
      <tbody>
        {stats.leads && <LeadsRows leads={stats.leads!} />}
        <StreaksRows streaks={stats.streaks} />
        <PointsBreakdownRows pointsBreakdown={stats.pointsBreakdown} />
      </tbody>
    </table>
  );
}
function PointsBreakdownRows({
  pointsBreakdown,
}: {
  pointsBreakdown: PointsBreakdownStats;
}) {
  const team1Serve = pointsBreakdown.team1.serve;
  const team2Serve = pointsBreakdown.team2.serve;
  const getServeDisplay = (serve: ServeReceiveRecord): string => {
    if (serve.num === 0) {
      return "-";
    }
    return `${Math.round(serve.winPercentage)} % (${serve.numWon} / ${serve.num})`;
  };
  return (
    <>
      <tr>
        <td>{getServeDisplay(team1Serve)}</td>
        <td>Services won</td>
        <td>{getServeDisplay(team2Serve)}</td>
      </tr>
    </>
  );
}
function StreaksRows({ streaks }: { streaks: StreaksStats }) {
  return (
    <tr>
      <td>{streaks.team1.longestStreak}</td>
      <td>Longest streak</td>
      <td>{streaks.team2.longestStreak}</td>
    </tr>
  );
}
function LeadsRows({ leads }: { leads: LeadsStats }) {
  return (
    <>
      <tr>
        <td>{leads.team1?.biggest ?? 0}</td>
        <td>Biggest lead</td>
        <td>{leads.team2?.biggest ?? 0}</td>
      </tr>
      <tr>
        <td>{leads.team1?.greatestDeficitOvercome ?? "-"}</td>
        <td>Greatest deficit overcome</td>
        <td>{leads.team2?.greatestDeficitOvercome ?? "-"}</td>
      </tr>
      <tr>
        <td>{`Lead changed ${leads.numChanges} time${leads.numChanges !== 1 ? "s" : ""}`}</td>
      </tr>
    </>
  );
}
