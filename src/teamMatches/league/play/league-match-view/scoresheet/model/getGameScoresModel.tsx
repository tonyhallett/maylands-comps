import { GameScore } from "../../../../../../umpire";
import { fillArray } from "../../../../../../helpers/fillArray";
import {
  TeamMatchWinState,
  TeamsMatchWinState,
} from "../../helpers/getTeamsMatchWinState";

export enum GameScorePointState {
  Normal,
  GamePoint,
  MatchPoint,
  Won,
}
const gameScorePointStateLookup = new Map<
  TeamMatchWinState,
  GameScorePointState
>([
  [TeamMatchWinState.Normal, GameScorePointState.Normal],
  [TeamMatchWinState.GamePoint, GameScorePointState.GamePoint],
  [TeamMatchWinState.MatchPoint, GameScorePointState.MatchPoint],
  [TeamMatchWinState.MatchWon, GameScorePointState.Won],
]);

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

const matchWon = (teamsMatchWinState: TeamsMatchWinState) =>
  teamsMatchWinState.home === TeamMatchWinState.MatchWon ||
  teamsMatchWinState.away === TeamMatchWinState.MatchWon;

const getGameNotWonGameScoreModel = (
  homeGameScoreDisplay: string,
  awayGameScoreDisplay: string,
  isLastGame: boolean,
  teamsMatchWinState: TeamsMatchWinState,
) => {
  const gameNotWon = isLastGame && !matchWon(teamsMatchWinState);

  if (gameNotWon) {
    return {
      home: {
        display: homeGameScoreDisplay,
        state: gameScorePointStateLookup.get(teamsMatchWinState.home)!,
      },
      away: {
        display: awayGameScoreDisplay,
        state: gameScorePointStateLookup.get(teamsMatchWinState.away)!,
      },
    };
  }
};

export const getGameScoreModelWithPoints = (
  gameScore: GameScore,
  teamsMatchWinState: TeamsMatchWinState,
  isLastGame: boolean,
): GameScoreModel => {
  const homeGameScoreDisplay = gameScore.team1Points.toString();
  const awayGameScoreDisplay = gameScore.team2Points.toString();
  return (
    getGameNotWonGameScoreModel(
      homeGameScoreDisplay,
      awayGameScoreDisplay,
      isLastGame,
      teamsMatchWinState,
    ) ??
    getGameWonGameScoreModel(
      homeGameScoreDisplay,
      awayGameScoreDisplay,
      gameScore,
    )
  );
};

const getGameWonGameScoreModel = (
  homeGameScoreDisplay: string,
  awayGameScoreDisplay: string,
  gameScore: GameScore,
) => {
  const homeTeamWon = gameScore.team1Points > gameScore.team2Points;
  return {
    home: {
      display: homeGameScoreDisplay,
      state: homeTeamWon ? GameScorePointState.Won : GameScorePointState.Normal,
    },
    away: {
      display: awayGameScoreDisplay,
      state: homeTeamWon ? GameScorePointState.Normal : GameScorePointState.Won,
    },
  };
};

export const getGameScoresModel = (
  gameScores: GameScore[],
  teamsMatchScoreState: TeamsMatchWinState,
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
