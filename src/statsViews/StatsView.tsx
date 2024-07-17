import { mangoFusionPalette } from "@mui/x-charts/colorPalettes";
import { GameScoreLineChart } from "./GameScoreLineChart";
import { GameScore, PointHistory } from "../umpire";
import { isGameOrMatchWon, isMatchWon } from "../umpire/pointStateHelpers";
import { scoreTooltipRenderer } from "./GameScoreLineChart/ScoreTooltipRenderer/scoreTooltipRenderer";
import Box from "@mui/material/Box/Box";
import { GameStats, getGameStats } from "../matchstats";
import { Leads } from "../matchstats/LeadStats";
import { Streaks } from "../matchstats/StreakStats";
import {
  PointsBreakdown,
  ServeReceiveRecord,
} from "../matchstats/PointsBreakdownStats";
import {
  GameMatchPoints,
  GameMatchPointState,
} from "../matchstats/GameMatchPointsStats";

enum SaveablePointState {
  Default,
  GamePoint,
  MatchPoint,
  SavedGamePoint,
  SavedMatchPoint,
}

function findInRangeGameMatchPointState(
  gameMatchPointStates: GameMatchPointState[],
  pointNumber,
): GameMatchPointState | undefined {
  for (let i = 0; i < gameMatchPointStates.length; i++) {
    const state = gameMatchPointStates[i];
    const inRange =
      state.pointNumber <= pointNumber &&
      pointNumber <= state.pointNumber + state.numGameMatchPoints;
    if (inRange) {
      return state;
    }
  }
}

function getSavedOrGameOrMatchPointState(
  gameMatchPointState: GameMatchPointState,
  pointNumber: number,
): SaveablePointState {
  const numPointsSinceEntered = pointNumber - gameMatchPointState.pointNumber;
  if (
    numPointsSinceEntered > 0 &&
    numPointsSinceEntered === gameMatchPointState.pointsSaved
  ) {
    return gameMatchPointState.isGamePoint
      ? SaveablePointState.SavedGamePoint
      : SaveablePointState.SavedMatchPoint;
  }
  return gameMatchPointState.isGamePoint
    ? SaveablePointState.GamePoint
    : SaveablePointState.MatchPoint;
}

function getSaveablePointState(
  gameMatchPoints: GameMatchPoints,
  pointNumber: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  team1WonPoint: boolean,
) {
  const team1State = findInRangeGameMatchPointState(
    gameMatchPoints.team1,
    pointNumber,
  );
  if (team1State !== undefined) {
    return getSavedOrGameOrMatchPointState(team1State, pointNumber);
  }
  const team2State = findInRangeGameMatchPointState(
    gameMatchPoints.team2,
    pointNumber,
  );
  if (team2State !== undefined) {
    return getSavedOrGameOrMatchPointState(team2State, pointNumber);
  }
  return SaveablePointState.Default;
}

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
              getColor(_, score, index) {
                if (isGameOrMatchWon(score.pointState)) {
                  return "white";
                }
                const pointsToHere = pointHistoryForGame.slice(0, index);
                const gameMatchPoints =
                  getGameStats(pointsToHere).gameMatchPoints;
                if (gameMatchPoints !== undefined) {
                  const state = getSaveablePointState(
                    gameMatchPoints,
                    index,
                    score.team1WonPoint,
                  );
                  switch (state) {
                    case SaveablePointState.GamePoint:
                      return "orange";
                    case SaveablePointState.MatchPoint:
                      return "red";
                    case SaveablePointState.SavedGamePoint:
                      return "green";
                    case SaveablePointState.SavedMatchPoint:
                      return "yellow";
                  }
                }
              },
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              getShape(team1, score) {
                if (isMatchWon(score.pointState)) {
                  return "star";
                }
                if (isGameOrMatchWon(score.pointState)) {
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
      {stats.leads && <LeadsRows leads={stats.leads!} />}
      <StreaksRows streaks={stats.streaks} />
      <PointsBreakdownRows pointsBreakdown={stats.pointsBreakdown} />
    </table>
  );
}
function PointsBreakdownRows({
  pointsBreakdown,
}: {
  pointsBreakdown: PointsBreakdown;
}) {
  const team1Serve = pointsBreakdown.team1.serve;
  const team2Serve = pointsBreakdown.team2.serve;
  const getServeDisplay = (serve: ServeReceiveRecord): string => {
    if (serve.num === 0) {
      return "-";
    }
    return `${serve.numWon} / ${serve.num} - ${Math.round(serve.winPercentage)} %`;
  };
  return (
    <>
      <tr>
        <td>{getServeDisplay(team1Serve)}</td>
        <td>Service</td>
        <td>{getServeDisplay(team2Serve)}</td>
      </tr>
    </>
  );
}
function StreaksRows({ streaks }: { streaks: Streaks }) {
  return (
    <tr>
      <td>{streaks.team1.longestStreak}</td>
      <td>Longest streak</td>
      <td>{streaks.team2.longestStreak}</td>
    </tr>
  );
}
function LeadsRows({ leads }: { leads: Leads }) {
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
    </>
  );
}
