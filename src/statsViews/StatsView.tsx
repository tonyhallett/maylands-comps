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
  ServeOrReceiveRecord,
} from "../matchstats/PointsBreakdownStatistician";
import {
  availableGameMatchPoints,
  GameMatchPointDeucesStats,
  gameMatchPointsSaved,
  GameMatchPointState,
} from "../matchstats/GameMatchPointDeucesStatistician";
import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function getGameScoreDisplay(gameScore: GameScore, team1Left: boolean) {
  return `${team1Left ? gameScore.team1Points : gameScore.team2Points} - ${!team1Left ? gameScore.team1Points : gameScore.team2Points}`;
}
const currentGameValue = "current";
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
  bestOf,
}: {
  matchWon: boolean;
  currentGameScore: GameScore;
  team1Left: boolean;
  gameScores: readonly GameScore[];
  pointHistory: readonly (readonly PointHistory[])[];
  team1StartScore: number;
  team2StartScore: number;
  gamePoint: number;
  upTo: number;
  team1Label: string;
  team2Label: string;
  bestOf: number;
}) {
  const [selectedGame, setSelectedGame] = useState(currentGameValue);
  gameScores = [...gameScores].reverse();
  if (!matchWon) {
    gameScores = [currentGameScore, ...gameScores];
  }
  const minX = upTo - Math.min(team1StartScore, team2StartScore);
  const numGameScores = gameScores.length;
  let gameToDisplay =
    selectedGame === currentGameValue
      ? pointHistory.length
      : Number.parseInt(selectedGame);

  if (gameToDisplay > numGameScores) {
    gameToDisplay = pointHistory.length;
  }

  const pointHistoryForGame = pointHistory[gameToDisplay - 1];
  const gameStats = getGameStats([...pointHistoryForGame]);
  const pointsScoredInGame = pointHistoryForGame.length > 0;
  const gameStatsView = (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Stats
        </AccordionSummary>
        <AccordionDetails>
          <GameStatsTable
            stats={gameStats}
            pointsScoredInGame={pointsScoredInGame}
          />
        </AccordionDetails>
      </Accordion>

      <Box
        data-id={`game-${gameToDisplay}-score-line-chart-container`}
        sx={{ width: "100%", height: 400 }}
      >
        <GameScoreLineChart
          key={gameToDisplay}
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
              if (gameStats.gameMatchPoints !== undefined) {
                const savedPointAt =
                  gameStats.gameMatchPoints.savedPointsAt.find(
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
    </>
  );

  const buttons =
    bestOf === 1 ? null : (
      <ToggleButtonGroup
        exclusive
        value={selectedGame}
        onChange={(_, newValue) => {
          if (newValue !== null) {
            setSelectedGame(newValue);
          }
        }}
      >
        <ToggleButton value={currentGameValue}>Current</ToggleButton>
        {gameScores.map((gameScore, i) => {
          // game scores are in reverse
          const gameNumber = numGameScores - i;
          return (
            <ToggleButton
              key={gameNumber}
              value={gameNumber.toString()}
            >{`G${gameNumber} ${getGameScoreDisplay(gameScore, team1Left)}`}</ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    );
  return (
    <>
      {buttons}
      {gameStatsView}
    </>
  );
}

function GameStatsTable({
  stats,
  pointsScoredInGame,
}: {
  stats: GameStats;
  pointsScoredInGame: boolean;
}) {
  const numPoints =
    stats.pointsBreakdown.team1.pointsWon +
    stats.pointsBreakdown.team1.pointsLost;
  return (
    <table>
      <tbody>
        <LeadsRows
          leads={stats.leads!}
          numPoints={numPoints}
          pointsScoredInGame={pointsScoredInGame}
        />
        <StreaksRows
          streaks={stats.streaks}
          pointsScoreInGame={pointsScoredInGame}
        />
        <PointsBreakdownRows pointsBreakdown={stats.pointsBreakdown} />
        <GameMatchPointDeuceStatsRows stats={stats.gameMatchPoints} />
      </tbody>
    </table>
  );
}

function getPercentageDisplay(
  percentage: number,
  numerator: number,
  denominator: number,
): string {
  return `${Math.round(percentage)} % (${numerator} / ${denominator})`;
}

function PointsBreakdownRows({
  pointsBreakdown,
}: {
  pointsBreakdown: PointsBreakdownStats;
}) {
  const team1Serve = pointsBreakdown.team1.serve;
  const team2Serve = pointsBreakdown.team2.serve;
  const getServeDisplay = (serve: ServeOrReceiveRecord): string => {
    if (serve.num === 0) {
      return "-";
    }
    return getPercentageDisplay(serve.winPercentage!, serve.numWon, serve.num);
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

function StreaksRows({
  streaks,
  pointsScoreInGame,
}: {
  streaks: StreaksStats;
  pointsScoreInGame: boolean;
}) {
  return (
    <tr>
      <td>{pointsScoreInGame ? streaks.team1.longestStreak : "-"}</td>
      <td>Longest streak</td>
      <td>{pointsScoreInGame ? streaks.team2.longestStreak : "-"}</td>
    </tr>
  );
}

function TeamRow({
  title,
  team1Value,
  team2Value,
}: {
  title: string;
  team1Value: string | number;
  team2Value: string | number;
}) {
  return (
    <tr>
      <td>{team1Value}</td>
      <td>{title}</td>
      <td>{team2Value}</td>
    </tr>
  );
}

function availableGameMatchPointsDisplay(states: GameMatchPointState[]) {
  if (states.length === 0) {
    return "0";
  }
  const available = availableGameMatchPoints(states);
  if (available === undefined) {
    return "0";
  }
  const gmp = available.isGamePoint ? "GP" : "MP";
  return `${available.available} ( ${gmp} )`;
}

function gameMatchPointsSavedDisplay(states: GameMatchPointState[]): string {
  const savedInfo = gameMatchPointsSaved(states);
  if (savedInfo === undefined) {
    return "-";
  }

  const percentageDisplay = getPercentageDisplay(
    (savedInfo.numSaved / savedInfo.numPoints) * 100,
    savedInfo.numSaved,
    savedInfo.numPoints,
  );
  const gpmp = savedInfo.isGamePoints ? "GP" : "MP";
  return `${percentageDisplay} ( ${gpmp} )`;
}

function GameMatchPointDeuceStatsRows({
  stats,
}: {
  stats: GameMatchPointDeucesStats | undefined;
}) {
  let team1GameMatchPointsDisplay = "-";
  let team2GameMatchPointsDisplay = "-";
  let team1GameMatchPointsSavedDisplay = "-";
  let team2GameMatchPointsSavedDisplay = "-";
  let gameMatchPointsTitle = "Game / Match points / Deuces";
  if (stats !== undefined) {
    team1GameMatchPointsDisplay = availableGameMatchPointsDisplay(stats.team1);
    team2GameMatchPointsDisplay = availableGameMatchPointsDisplay(stats.team2);
    team1GameMatchPointsSavedDisplay = gameMatchPointsSavedDisplay(stats.team1);
    team2GameMatchPointsSavedDisplay = gameMatchPointsSavedDisplay(stats.team2);
    const deuceDisplay = stats.numDeuces === 1 ? "deuce" : "deuces";
    gameMatchPointsTitle = `Game / Match points / ${stats.numDeuces} ${deuceDisplay}`;
  }
  return (
    <>
      <TeamRow
        title={gameMatchPointsTitle}
        team1Value={team1GameMatchPointsDisplay}
        team2Value={team2GameMatchPointsDisplay}
      />
      <TeamRow
        title="Game / Match points saved"
        team1Value={team1GameMatchPointsSavedDisplay}
        team2Value={team2GameMatchPointsSavedDisplay}
      />
    </>
  );
}

function LeadsRows({
  leads,
  numPoints,
  pointsScoredInGame,
}: {
  leads: LeadsStats;
  numPoints: number;
  pointsScoredInGame: boolean;
}) {
  const getGreatestDeficitOvercomeDisplay = (
    deficit: number | undefined,
  ): string => {
    if (deficit === undefined) {
      return "-";
    }
    return deficit.toString();
  };

  const gameInLeadDisplay = (
    numPointsInLead: number,
    percentageOfGameInLead: number | undefined,
  ): string => {
    if (percentageOfGameInLead === undefined) {
      return "-";
    }
    return getPercentageDisplay(
      percentageOfGameInLead,
      numPointsInLead,
      numPoints,
    );
  };

  return (
    <>
      <TeamRow
        title="Biggest lead"
        team1Value={pointsScoredInGame ? leads.team1.biggest : "-"}
        team2Value={pointsScoredInGame ? leads.team2.biggest : "-"}
      />
      <TeamRow
        title="Greatest deficit overcome"
        team1Value={getGreatestDeficitOvercomeDisplay(
          leads.team1.greatestDeficitOvercome,
        )}
        team2Value={getGreatestDeficitOvercomeDisplay(
          leads.team2.greatestDeficitOvercome,
        )}
      />
      <TeamRow
        title="Leading for"
        team1Value={gameInLeadDisplay(
          leads.team1.numPointsInLead,
          leads.team1.percentageOfGameInLead,
        )}
        team2Value={gameInLeadDisplay(
          leads.team2.numPointsInLead,
          leads.team2.percentageOfGameInLead,
        )}
      />
      <TeamRow
        title="Times leading"
        team1Value={pointsScoredInGame ? leads.team1.leads.length : "-"}
        team2Value={pointsScoredInGame ? leads.team2.leads.length : "-"}
      />
    </>
  );
}
