import { GameScore } from "../../umpire";
import { fillArray } from "../../helpers/fillArray";
import {
  MatchScoreState,
  TeamsMatchScoreState,
} from "./getTeamsMatchScoreState";

export enum GameScorePointState {
  Normal,
  GamePoint,
  MatchPoint,
  Won,
}
const convertMatchScoreState = (matchScoreState: MatchScoreState) => {
  switch (matchScoreState) {
    case MatchScoreState.GamePoint:
      return GameScorePointState.GamePoint;
    case MatchScoreState.MatchPoint:
      return GameScorePointState.MatchPoint;
    case MatchScoreState.Normal:
      return GameScorePointState.Normal;
  }
  throw new Error("Invalid state");
};
export interface PointsInfo {
  display: string;
  state: GameScorePointState;
}
export interface GameScoreDisplay {
  home: PointsInfo;
  away: PointsInfo;
}

export const getGameScoresDisplay = (
  gameScores: GameScore[],
  teamsMatchScoreState: TeamsMatchScoreState,
  umpired: boolean | undefined,
): GameScoreDisplay[] => {
  return fillArray(5, (i) => {
    const defaultPointsInfo: PointsInfo = {
      display: "-",
      state: GameScorePointState.Normal,
    };
    let gameScoreDisplay: GameScoreDisplay = {
      home: defaultPointsInfo,
      away: defaultPointsInfo,
    };
    const gameScore = gameScores[i];
    const firstGameAndNoPointsScored = () => {
      return (
        i === 0 && gameScore.team1Points === 0 && gameScore.team2Points === 0
      );
    };

    const useDefault =
      gameScore === undefined ||
      (firstGameAndNoPointsScored() && umpired === undefined);
    if (!useDefault) {
      const homeGameScoreDisplay = gameScore.team1Points.toString();
      const awayGameScoreDisplay = gameScore.team2Points.toString();

      const gameWon =
        teamsMatchScoreState.home === MatchScoreState.MatchWon ||
        teamsMatchScoreState.away === MatchScoreState.MatchWon;
      const isLastGame = i === gameScores.length - 1;
      const useTeamsMatchScoreState = isLastGame && !gameWon;

      if (useTeamsMatchScoreState) {
        gameScoreDisplay = {
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
        gameScoreDisplay = {
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
    }
    return gameScoreDisplay;
  });
};
