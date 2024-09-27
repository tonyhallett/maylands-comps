import { GameScore } from "../../../../../../umpire";
import { fillArray } from "../../../../../../helpers/fillArray";
import {
  TeamMatchScoreState,
  TeamsMatchScoreState,
} from "../../helpers/getTeamsMatchScoreState";

export enum GameScorePointState {
  Normal,
  GamePoint,
  MatchPoint,
  Won,
}
const convertMatchScoreState = (matchScoreState: TeamMatchScoreState) => {
  switch (matchScoreState) {
    case TeamMatchScoreState.GamePoint:
      return GameScorePointState.GamePoint;
    case TeamMatchScoreState.MatchPoint:
      return GameScorePointState.MatchPoint;
    case TeamMatchScoreState.Normal:
      return GameScorePointState.Normal;
  }
  throw new Error("Invalid state");
};
export interface PointsInfo {
  display: string;
  state: GameScorePointState;
}
export interface GameScoreModel {
  home: PointsInfo;
  away: PointsInfo;
}
const firstGameAndNoPointsScored = (
  firstGame: boolean,
  gameScore: GameScore,
) => {
  return (
    firstGame && gameScore.team1Points === 0 && gameScore.team2Points === 0
  );
};

const getDefaultGameScoreModel = () => {
  const defaultPointsInfo: PointsInfo = {
    display: "-",
    state: GameScorePointState.Normal,
  };
  const gameScoreDisplay: GameScoreModel = {
    home: defaultPointsInfo,
    away: defaultPointsInfo,
  };
  return gameScoreDisplay;
};
const getDefaultGameScoreModelIfNecessary = (
  firstGame: boolean,
  gameScore: GameScore,
  umpired: boolean | undefined,
) => {
  const useDefault =
    gameScore === undefined ||
    (firstGameAndNoPointsScored(firstGame, gameScore) && umpired === undefined);
  if (useDefault) {
    return getDefaultGameScoreModel();
  }
};

export const getGameScoreModelWithPoints = (
  gameScore: GameScore,
  teamsMatchScoreState: TeamsMatchScoreState,
  isLastGame: boolean,
) => {
  const homeGameScoreDisplay = gameScore.team1Points.toString();
  const awayGameScoreDisplay = gameScore.team2Points.toString();

  const gameWon =
    teamsMatchScoreState.home === TeamMatchScoreState.MatchWon ||
    teamsMatchScoreState.away === TeamMatchScoreState.MatchWon;

  const useTeamsMatchScoreState = isLastGame && !gameWon;

  if (useTeamsMatchScoreState) {
    return {
      home: {
        display: homeGameScoreDisplay,
        state: convertMatchScoreState(teamsMatchScoreState.home),
      },
      away: {
        display: awayGameScoreDisplay,
        state: convertMatchScoreState(teamsMatchScoreState.away),
      },
    };
  } else {
    const homeTeamWon = gameScore.team1Points > gameScore.team2Points;
    return {
      home: {
        display: homeGameScoreDisplay,
        state: homeTeamWon
          ? GameScorePointState.Won
          : GameScorePointState.Normal,
      },
      away: {
        display: awayGameScoreDisplay,
        state: homeTeamWon
          ? GameScorePointState.Normal
          : GameScorePointState.Won,
      },
    };
  }
};

export const getGameScoresModel = (
  gameScores: GameScore[],
  teamsMatchScoreState: TeamsMatchScoreState,
  umpired: boolean | undefined,
): GameScoreModel[] => {
  return fillArray(5, (i) => {
    const gameScore = gameScores[i];
    return (
      getDefaultGameScoreModelIfNecessary(i === 0, gameScore, umpired) ??
      getGameScoreModelWithPoints(
        gameScore,
        teamsMatchScoreState,
        i === gameScores.length - 1,
      )
    );
  });
};
