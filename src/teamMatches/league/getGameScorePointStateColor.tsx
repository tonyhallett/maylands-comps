import { GameScorePointState } from "./getGameScoresDisplay";

export const getGameScorePointStateColor = (state: GameScorePointState) => {
  switch (state) {
    case GameScorePointState.Won:
      return "#99a7ff";
    case GameScorePointState.GamePoint:
      return "yellow";
    case GameScorePointState.MatchPoint:
      return "pink";
    case GameScorePointState.Normal:
      return "inherit";
  }
};
